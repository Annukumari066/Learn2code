import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { colors, isDark, toggleTheme } = useTheme();
  const { width } = useWindowDimensions();
  const [isPro, setIsPro] = useState(false);
  const [proModalVisible, setProModalVisible] = useState(false);

  const isMobile = width < 1024;

  useEffect(() => {
    loadProStatus();
  }, []);

  const loadProStatus = async () => {
    try {
      const savedIsPro = await AsyncStorage.getItem('@is_pro');
      if (savedIsPro === 'true') {
        setIsPro(true);
      }
    } catch (error) {
      console.log('Error loading pro status in sidebar', error);
    }
  };

  const handleSubscribePro = async (plan: string) => {
    try {
      setIsPro(true);
      await AsyncStorage.setItem('@is_pro', 'true');
      setProModalVisible(false);
      Alert.alert('Welcome to Pro!', `You have successfully subscribed to the ${plan} plan. Premium features unlocked.`);
    } catch (error) {
      console.log('Error saving pro status', error);
    }
  };

  const logout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            router.replace('/login');
          } 
        }
      ]
    );
  };

  const navigateTo = (route: string) => {
    if (pathname === route) return;
    router.push(route as any);
  };

  if (isMobile) return null;

  const menuItems = [
    { name: 'Dashboard', icon: 'grid-outline', route: '/home' },
    { name: 'My Learning', icon: 'book-outline', route: '/learn' },
    { name: 'Flashcards', icon: 'copy-outline', route: '/flashcards' },
    { name: 'Quizzes', icon: 'help-circle-outline', route: '/mcq' },
    { name: 'Achievements', icon: 'trophy-outline', route: '/leaderboard' },
    { name: 'Stats', icon: 'bar-chart-outline', route: '/home' },
    { name: 'Profile', icon: 'person-outline', route: '/account' },
    { name: 'Settings', icon: 'settings-outline', route: pathname, action: toggleTheme },
    { name: 'Help & Support', icon: 'information-circle-outline', route: pathname, action: () => Alert.alert('Help & Support', 'Email us at support@learn2code.com') },
    { name: 'Logout', icon: 'log-out-outline', route: pathname, action: logout },
  ];

  const themedStyles = getStyles(colors, isDark);

  return (
    <View style={themedStyles.sidebar}>
      <View style={themedStyles.sidebarHeader}>
        <View style={themedStyles.brandLogo}>
          <Text style={themedStyles.brandLogoText}>&lt;/&gt;</Text>
        </View>
        <View style={{ marginLeft: 12 }}>
          <Text style={themedStyles.brandName}>LEARN2CODE</Text>
          <Text style={themedStyles.brandSub}>Programming Flashcards</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1, marginTop: 4 }} showsVerticalScrollIndicator={false}>
        {menuItems.map((item, idx) => {
          const isActive = pathname === item.route && item.name !== 'Settings' && item.name !== 'Help & Support' && item.name !== 'Logout';
          return (
            <TouchableOpacity
              key={idx}
              style={[themedStyles.sidebarLink, isActive && themedStyles.sidebarLinkActive]}
              activeOpacity={0.7}
              onPress={() => item.action ? item.action() : navigateTo(item.route)}
            >
              <Ionicons
                name={item.icon as any}
                size={18}
                color={isActive ? '#ffffff' : colors.textSecondary}
                style={{ marginRight: 12 }}
              />
              <Text style={[themedStyles.sidebarLinkText, isActive && themedStyles.sidebarLinkTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Upgrade to Pro Card */}
      <View style={themedStyles.proCard}>
        <View style={themedStyles.proCardHeader}>
          <Ionicons name="ribbon" size={20} color="#F59E0B" />
          <Text style={themedStyles.proCardTitle}>{isPro ? 'Pro Member' : 'Upgrade to Pro'}</Text>
        </View>
        <View style={themedStyles.proCardList}>
          {[
            'Unlimited flashcards',
            'Advanced analytics',
            'Custom quizzes',
            'No ads experience',
          ].map((feature, i) => (
            <View key={i} style={themedStyles.proCardListItem}>
              <Ionicons name="checkmark-circle" size={12} color="#10B981" style={{ marginRight: 4 }} />
              <Text style={themedStyles.proCardListText}>{feature}</Text>
            </View>
          ))}
        </View>
        {!isPro && (
          <TouchableOpacity
            style={themedStyles.proCardBtn}
            activeOpacity={0.8}
            onPress={() => setProModalVisible(true)}
          >
            <Text style={themedStyles.proCardBtnText}>Upgrade Now</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* PRO UPGRADE SUBSCRIPTION MODAL */}
      <Modal
        visible={proModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setProModalVisible(false)}
      >
        <View style={themedStyles.modalOverlay}>
          <View style={themedStyles.modalBody}>
            <View style={themedStyles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="ribbon" size={24} color="#F59E0B" style={{ marginRight: 8 }} />
                <Text style={themedStyles.modalTitle}>Upgrade to Learn2Code Pro</Text>
              </View>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setProModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 20 }}>
              <Text style={{ color: colors.textSecondary, marginBottom: 20, textAlign: 'center', fontSize: 14 }}>
                Unlock access to premium coding analytics, infinite decks, custom exam creation, and an ad-free interface.
              </Text>

              {/* Pricing Cards */}
              <View style={{ gap: 16, marginBottom: 20 }}>
                {/* Monthly */}
                <TouchableOpacity
                  style={themedStyles.priceOptionCard}
                  activeOpacity={0.85}
                  onPress={() => handleSubscribePro('Monthly')}
                >
                  <View>
                    <Text style={themedStyles.priceOptionTitle}>Monthly Membership</Text>
                    <Text style={themedStyles.priceOptionDesc}>Full access billed month-to-month</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={themedStyles.priceOptionCost}>$4.99</Text>
                    <Text style={themedStyles.priceOptionPeriod}>/ month</Text>
                  </View>
                </TouchableOpacity>

                {/* Yearly */}
                <TouchableOpacity
                  style={[themedStyles.priceOptionCard, { borderColor: '#4f46e5', borderWidth: 2 }]}
                  activeOpacity={0.85}
                  onPress={() => handleSubscribePro('Yearly')}
                >
                  <View style={themedStyles.popularBadge}>
                    <Text style={themedStyles.popularBadgeText}>Best Value</Text>
                  </View>
                  <View>
                    <Text style={themedStyles.priceOptionTitle}>Annual Membership</Text>
                    <Text style={themedStyles.priceOptionDesc}>Save 33% over monthly pricing</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={themedStyles.priceOptionCost}>$39.99</Text>
                    <Text style={themedStyles.priceOptionPeriod}>/ year</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[themedStyles.proCardBtn, { marginBottom: 20, paddingVertical: 12 }]}
                onPress={() => handleSubscribePro('Trial')}
              >
                <Text style={[themedStyles.proCardBtnText, { color: '#ffffff' }]}>Start 7-Day Free Trial</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  sidebar: {
    width: 260,
    backgroundColor: colors.card,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingVertical: 18,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    height: '100%',
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  brandLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandLogoText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.5,
  },
  brandSub: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  sidebarLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 2,
  },
  sidebarLinkActive: {
    backgroundColor: '#4f46e5',
  },
  sidebarLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  sidebarLinkTextActive: {
    color: '#ffffff',
  },
  proCard: {
    backgroundColor: isDark ? 'rgba(30, 41, 59, 0.4)' : '#f8fafc',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  proCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  proCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    marginLeft: 6,
  },
  proCardList: {
    gap: 4,
    marginBottom: 8,
  },
  proCardListItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  proCardListText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  proCardBtn: {
    backgroundColor: '#4f46e5',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  proCardBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },

  // Modal styles for Upgrade in Sidebar
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBody: {
    width: '100%',
    maxWidth: 450,
    maxHeight: '85%',
    backgroundColor: colors.card,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  priceOptionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    backgroundColor: '#4f46e5',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  popularBadgeText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  priceOptionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  priceOptionDesc: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  priceOptionCost: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  priceOptionPeriod: {
    fontSize: 9,
    color: colors.textSecondary,
  },
});
