import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import { useTheme } from '../context/ThemeContext';


interface LeaderboardUser {
  _id: string;
  name: string;
  points: number;
  streak: number;
  quizzes: number;
  studyTime: number;
}

interface CurrentUserStats {
  rank: number | null;
  points: number;
  name: string;
  streak: number;
  quizzes: number;
  studyTime: number;
}

export default function Leaderboard() {
  const { isDark, colors } = useTheme();
  const styles = getStyles(colors, isDark);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [offline, setOffline] = useState(false);

  const fetchLeaderboard = async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    // 1. Try reading from cache first
    try {
      const cached = await AsyncStorage.getItem('leaderboard_cache');
      if (cached) {
        const { leaderboard: cachedList, currentUser: cachedUser } = JSON.parse(cached);
        setLeaderboard(cachedList);
        setCurrentUser(cachedUser);
      }
    } catch (e) {
      console.log('Error reading leaderboard cache:', e);
    }

    // 2. Fetch from backend
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setLoading(false);
        setRefreshing(false);
        // If not logged in, redirect to login
        router.replace('/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/leaderboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
        setCurrentUser(data.currentUser || null);
        setOffline(false);

        // Update cache
        await AsyncStorage.setItem('leaderboard_cache', JSON.stringify(data));
      } else {
        setOffline(true);
      }
    } catch (err) {
      console.log('Failed to fetch leaderboard:', err);
      setOffline(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  const onRefresh = () => {
    fetchLeaderboard(true);
  };

  // Podium Positions (1st, 2nd, 3rd)
  const firstPlace = leaderboard[0];
  const secondPlace = leaderboard[1];
  const thirdPlace = leaderboard[2];
  const remainingUsers = leaderboard.slice(3);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={{ flex: 1 }}>
          <LinearGradient
            colors={isDark ? ['#0b0f19', '#1e293b'] : ['#f8fafc', '#f1f5f9']}
            style={styles.container}
          >
            {/* Header */}
            {isMobile ? (
              <LinearGradient
                colors={[colors.navBgStart, colors.navBgEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.header}
              >
                <View style={styles.headerRow}>
                  <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => router.push('/home')}
                  >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                  </TouchableOpacity>
                  <Text style={styles.headerTitle}>Real-Time Leaderboard</Text>
                  <TouchableOpacity
                    style={styles.refreshBtn}
                    onPress={() => fetchLeaderboard(true)}
                    disabled={loading || refreshing}
                  >
                    {refreshing ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Ionicons name="refresh" size={24} color="#fff" />
                    )}
                  </TouchableOpacity>
                </View>

                {offline && (
                  <View style={styles.offlineBanner}>
                    <Ionicons name="cloud-offline-outline" size={14} color="#b91c1c" />
                    <Text style={styles.offlineText}>Offline Mode (Showing cached data)</Text>
                  </View>
                )}
              </LinearGradient>
            ) : (
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 24,
                paddingVertical: 14,
                backgroundColor: colors.card,
                borderBottomWidth: 1,
                borderColor: colors.border,
              }}>
                <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>Achievements & Leaderboard</Text>
                <TouchableOpacity
                  style={{
                    padding: 8,
                    borderRadius: 10,
                    backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                    width: 36,
                    height: 36,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                  onPress={() => fetchLeaderboard(true)}
                  disabled={loading || refreshing}
                >
                  {refreshing ? (
                    <ActivityIndicator size="small" color={colors.text} />
                  ) : (
                    <Ionicons name="refresh" size={18} color={colors.text} />
                  )}
                </TouchableOpacity>
              </View>
            )}

      {loading && leaderboard.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading Rankings...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} tintColor={colors.accent} />
          }
        >
          {/* Top 3 Podium Displays */}
          {leaderboard.length > 0 && (
            <View style={[styles.podiumContainer, isMobile && styles.podiumMobile]}>
              
              {/* 2nd Place */}
              {secondPlace && (
                <View style={[styles.podiumCard, styles.silverPodium, isMobile && styles.podiumCardMobile]}>
                  <Text style={styles.podiumRankText}>🥈 2nd</Text>
                  <View style={[styles.avatar, styles.silverAvatar]}>
                    <Text style={styles.avatarText}>{getInitials(secondPlace.name)}</Text>
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>{secondPlace.name}</Text>
                  <Text style={styles.podiumPoints}>{secondPlace.points.toLocaleString()} XP</Text>
                  <View style={styles.podiumStatsRow}>
                    <Text style={styles.podiumStatText}>🔥 {secondPlace.streak}</Text>
                    <Text style={styles.podiumStatText}>📝 {secondPlace.quizzes}</Text>
                  </View>
                </View>
              )}

              {/* 1st Place */}
              {firstPlace && (
                <View style={[styles.podiumCard, styles.goldPodium, isMobile && styles.podiumCardMobile, { transform: [{ scale: isMobile ? 1 : 1.08 }] }]}>
                  <View style={styles.crownContainer}>
                    <Text style={styles.crownEmoji}>👑</Text>
                  </View>
                  <Text style={styles.podiumRankTextGold}>🥇 1st</Text>
                  <View style={[styles.avatar, styles.goldAvatar]}>
                    <Text style={styles.avatarText}>{getInitials(firstPlace.name)}</Text>
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>{firstPlace.name}</Text>
                  <Text style={styles.podiumPointsGold}>{firstPlace.points.toLocaleString()} XP</Text>
                  <View style={styles.podiumStatsRow}>
                    <Text style={styles.podiumStatText}>🔥 {firstPlace.streak}</Text>
                    <Text style={styles.podiumStatText}>📝 {firstPlace.quizzes}</Text>
                  </View>
                </View>
              )}

              {/* 3rd Place */}
              {thirdPlace && (
                <View style={[styles.podiumCard, styles.bronzePodium, isMobile && styles.podiumCardMobile]}>
                  <Text style={styles.podiumRankText}>🥉 3rd</Text>
                  <View style={[styles.avatar, styles.bronzeAvatar]}>
                    <Text style={styles.avatarText}>{getInitials(thirdPlace.name)}</Text>
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>{thirdPlace.name}</Text>
                  <Text style={styles.podiumPoints}>{thirdPlace.points.toLocaleString()} XP</Text>
                  <View style={styles.podiumStatsRow}>
                    <Text style={styles.podiumStatText}>🔥 {thirdPlace.streak}</Text>
                    <Text style={styles.podiumStatText}>📝 {thirdPlace.quizzes}</Text>
                  </View>
                </View>
              )}

            </View>
          )}

          {/* Leaderboard List Header */}
          <Text style={styles.listSectionTitle}>All Standings</Text>

          {/* Standings List */}
          {remainingUsers.length > 0 ? (
            <View style={styles.listContainer}>
              {remainingUsers.map((item, index) => {
                const actualRank = index + 4;
                return (
                  <View key={item._id} style={styles.rowItem}>
                    <Text style={styles.rowRank}>#{actualRank}</Text>
                    <View style={styles.rowAvatar}>
                      <Text style={styles.rowAvatarText}>{getInitials(item.name)}</Text>
                    </View>
                    <View style={styles.rowInfo}>
                      <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
                      <View style={styles.rowStats}>
                        <Text style={styles.rowStatDetail}>🔥 {item.streak} day streak</Text>
                        <Text style={styles.rowStatDot}>•</Text>
                        <Text style={styles.rowStatDetail}>📝 {item.quizzes} tests</Text>
                      </View>
                    </View>
                    <Text style={styles.rowPoints}>{item.points.toLocaleString()} XP</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            leaderboard.length <= 3 && (
              <View style={styles.emptyContainer}>
                <Ionicons name="trophy-outline" size={48} color="#94a3b8" />
                <Text style={styles.emptyText}>No other ranks yet. Be the first to claim a spot!</Text>
              </View>
            )
          )}
        </ScrollView>
      )}

      {/* Current User Float Card */}
      {currentUser && (
        <LinearGradient
          colors={isDark ? [colors.surface, colors.surface] : ['#ffffff', '#f8fafc']}
          style={styles.floatingFooter}
        >
          <View style={styles.footerRow}>
            <View style={styles.footerRankBox}>
              <Text style={styles.footerRankLabel}>YOUR RANK</Text>
              <Text style={styles.footerRankValue}>
                {currentUser.rank ? `#${currentUser.rank}` : 'Unranked'}
              </Text>
            </View>
            
            <View style={styles.footerSeparator} />

            <View style={styles.footerInfoBox}>
              <Text style={styles.footerName}>{currentUser.name} (You)</Text>
              <View style={styles.footerStats}>
                <Text style={styles.footerStatDetail}>🔥 {currentUser.streak}</Text>
                <Text style={styles.footerStatDot}>•</Text>
                <Text style={styles.footerStatDetail}>📝 {currentUser.quizzes} Quizzes</Text>
                <Text style={styles.footerStatDot}>•</Text>
                <Text style={styles.footerStatDetail}>⏱ {currentUser.studyTime}m Study</Text>
              </View>
            </View>

            <View style={styles.footerSeparator} />

            <View style={styles.footerPointsBox}>
              <Text style={styles.footerPointsValue}>{currentUser.points.toLocaleString()}</Text>
              <Text style={styles.footerPointsLabel}>XP</Text>
            </View>
          </View>
        </LinearGradient>
      )}
    </LinearGradient>
      </View>
    </View>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  header: {
    paddingTop: Platform.OS === 'ios' ? 48 : 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: colors.navBgStart,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
  },

  refreshBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDark ? '#7f1d1d' : '#fee2e2',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginTop: 10,
    alignSelf: 'center',
  },

  offlineText: {
    color: isDark ? '#fca5a5' : '#991b1b',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 6,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 140, // offset for floating footer
  },

  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 10,
    marginBottom: 24,
    paddingHorizontal: 8,
  },

  podiumMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },

  podiumCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  podiumCardMobile: {
    width: '100%',
    maxWidth: 320,
  },

  goldPodium: {
    width: '34%',
    borderColor: isDark ? '#854d0e' : '#fef08a',
    backgroundColor: isDark ? '#1e293b' : '#fffdf5',
    elevation: 6,
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },

  silverPodium: {
    width: '31%',
    borderColor: colors.border,
  },

  bronzePodium: {
    width: '31%',
    borderColor: isDark ? '#7c2d12' : '#fed7aa',
  },

  crownContainer: {
    position: 'absolute',
    top: -24,
    zIndex: 100,
  },

  crownEmoji: {
    fontSize: 28,
  },

  podiumRankText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
    marginBottom: 8,
  },

  podiumRankTextGold: {
    fontSize: 12,
    fontWeight: '900',
    color: isDark ? '#facc15' : '#ca8a04',
    marginBottom: 8,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  goldAvatar: {
    backgroundColor: '#fde047',
    borderWidth: 2,
    borderColor: '#eab308',
  },

  silverAvatar: {
    backgroundColor: '#cbd5e1',
    borderWidth: 2,
    borderColor: '#94a3b8',
  },

  bronzeAvatar: {
    backgroundColor: '#fed7aa',
    borderWidth: 2,
    borderColor: '#f97316',
  },

  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },

  podiumName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
    width: '100%',
  },

  podiumPoints: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.accent,
  },

  podiumPointsGold: {
    fontSize: 14,
    fontWeight: '900',
    color: isDark ? '#facc15' : '#ca8a04',
  },

  podiumStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },

  podiumStatText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },

  listSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
    paddingLeft: 4,
  },

  listContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },

  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  rowRank: {
    width: 36,
    fontSize: 13,
    fontWeight: '800',
    color: colors.textSecondary,
  },

  rowAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: isDark ? '#1e3a8a' : '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  rowAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: isDark ? '#60a5fa' : '#0369a1',
  },

  rowInfo: {
    flex: 1,
  },

  rowName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },

  rowStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rowStatDetail: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  rowStatDot: {
    fontSize: 10,
    color: colors.border,
    marginHorizontal: 4,
  },

  rowPoints: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },

  emptyText: {
    marginTop: 12,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: '80%',
  },

  /* Floating Footer Styling */
  floatingFooter: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: colors.navBgStart,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },

  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  footerRankBox: {
    alignItems: 'center',
    width: 65,
  },

  footerRankLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  footerRankValue: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.accent,
  },

  footerSeparator: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },

  footerInfoBox: {
    flex: 1,
    paddingHorizontal: 12,
  },

  footerName: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 3,
  },

  footerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  footerStatDetail: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },

  footerStatDot: {
    fontSize: 8,
    color: colors.border,
    marginHorizontal: 4,
  },

  footerPointsBox: {
    alignItems: 'center',
    width: 60,
  },

  footerPointsValue: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.accent,
  },

  footerPointsLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: 0.5,
  },
});
