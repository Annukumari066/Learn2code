import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

interface PersonalNote {
  id: string;
  lang: string;
  title: string;
  content: string;
  createdAt: string;
}

interface PredefinedExplanation {
  explanation: string;
  code: string;
  takeaways: string[];
}

const predefinedDetails: Record<string, Record<string, PredefinedExplanation>> = {
  C: {
    'Variables': {
      explanation: 'In C, a variable is a named storage location in memory. It has a specific type that determines the size and layout of the variable\'s memory.',
      code: 'int age = 25;\nfloat price = 99.99;\nchar grade = \'A\';',
      takeaways: [
        'Variables must be declared before they are used.',
        'Names can contain letters, digits, and underscores, but must start with a letter or underscore.',
        'C is case-sensitive (e.g., \'Age\' and \'age\' are different variables).'
      ]
    },
    'Data Types': {
      explanation: 'Data types specify the size and type of values that a variable can store. C supports primary data types (int, float, char, double) and derived types (arrays, pointers, structs).',
      code: 'int number = 10;       // Stores integers (4 bytes)\nfloat decimal = 5.75;   // Stores decimals (4 bytes)\ndouble precise = 5.754; // High precision decimals (8 bytes)\nchar letter = \'B\';     // Stores a single character (1 byte)',
      takeaways: [
        'Format specifiers are used for output/input (e.g., %d for int, %f for float, %c for char).',
        'Sizes of data types can vary slightly depending on the compiler and architecture.'
      ]
    },
    'Loops': {
      explanation: 'Loops allow you to execute a block of code repeatedly based on a condition. C supports three main types of loops: for, while, and do-while.',
      code: '// For Loop\nfor (int i = 0; i < 5; i++) {\n    printf("%d ", i);\n}\n\n// While Loop\nint count = 0;\nwhile (count < 5) {\n    printf("%d ", count);\n    count++;\n}',
      takeaways: [
        'for loops are preferred when the number of iterations is known in advance.',
        'while loops are used when iteration count depends on a dynamic condition.',
        'do-while loops execute the body at least once before checking the condition.'
      ]
    },
    'Arrays': {
      explanation: 'An array is a collection of elements of the same data type stored in contiguous memory locations. It allows storing multiple values in a single variable.',
      code: 'int numbers[5] = {10, 20, 30, 40, 50};\n\n// Accessing array elements\nprintf("First element: %d", numbers[0]); // Output: 10\n\n// Modifying an element\nnumbers[1] = 25;',
      takeaways: [
        'Arrays in C are zero-indexed (indexing starts at 0).',
        'The size of an array is fixed at compile-time and cannot be changed.',
        'The compiler does not check array boundary limits, which can cause buffer overflows.'
      ]
    },
    'Functions': {
      explanation: 'A function is a self-contained block of code that performs a specific task. Functions promote modularity, readability, and code reuse.',
      code: '// Function Declaration (Prototype)\nint add(int a, int b);\n\n// Function Definition\nint add(int a, int b) {\n    return a + b;\n}\n\n// Calling the function\nint result = add(5, 7); // result is 12',
      takeaways: [
        'Every C program must have at least one function, which is the main() function.',
        'Functions can accept parameters (inputs) and return a single value (output).',
        'C uses "pass by value" by default (variables passed are copied).'
      ]
    }
  },
  Cpp: {
    'OOP': {
      explanation: 'C++ is a multi-paradigm language that supports Object-Oriented Programming (OOP). OOP organizes programs around objects (real-world entities) rather than functions.',
      code: 'class Animal {\npublic:\n    virtual void sound() = 0; // Pure virtual function (Abstraction)\n};',
      takeaways: [
        'Features 4 core pillars: Encapsulation, Inheritance, Polymorphism, and Abstraction.',
        'Provides modularity, ease of maintenance, and high code reusability.'
      ]
    },
    'Classes & Objects': {
      explanation: 'A class is a user-defined data type that serves as a blueprint or template for creating objects. An object is an instance of a class.',
      code: 'class Car {\npublic:\n    string brand;\n    int year;\n    void display() {\n        cout << brand << " (" << year << ")" << endl;\n    }\n};\n\nCar myCar; // Creating an object\nmyCar.brand = "Toyota";\nmyCar.year = 2022;\nmyCar.display();',
      takeaways: [
        'Classes encapsulate member variables (attributes) and member functions (methods).',
        'Access specifiers (public, private, protected) control data access and security.'
      ]
    },
    'Inheritance': {
      explanation: 'Inheritance allows a new class (derived class) to inherit attributes and methods of an existing class (base class). This promotes code reuse.',
      code: 'class Vehicle {\npublic:\n    void honk() { cout << "Beep!" << endl; }\n};\n\nclass Bicycle : public Vehicle {\npublic:\n    int gears = 6;\n};\n\nBicycle myBike;\nmyBike.honk(); // Inherited from Vehicle class',
      takeaways: [
        'Saves development time and avoids duplicate code.',
        'C++ supports multiple inheritance (inheriting from more than one base class).'
      ]
    },
    'Polymorphism': {
      explanation: 'Polymorphism translates to "many forms". It allows methods to execute differently based on the object calling them. C++ supports compile-time and run-time polymorphism.',
      code: 'class Animal {\npublic:\n    virtual void sound() { cout << "Animal noise" << endl; }\n};\n\nclass Dog : public Animal {\npublic:\n    void sound() override { cout << "Woof!" << endl; }\n};',
      takeaways: [
        'Compile-time polymorphism is achieved using function and operator overloading.',
        'Run-time polymorphism is achieved using inheritance and virtual functions.'
      ]
    },
    'Constructors': {
      explanation: 'A constructor is a special member function automatically called when an object of a class is created. It is used to initialize object properties.',
      code: 'class Student {\npublic:\n    string name;\n    // Parameterized Constructor\n    Student(string x) {\n        name = x;\n    }\n};\n\nStudent s1("Alice");',
      takeaways: [
        'Has the exact same name as the class and does not specify any return type.',
        'Can be overloaded (multiple constructors with different parameter signatures).'
      ]
    }
  },
  Java: {
    'JVM': {
      explanation: 'The JVM (Java Virtual Machine) is an abstract computing machine that enables Java programs to run. It compiles and executes bytecode (.class files) to machine-specific code.',
      code: '// Java code compiled to .class bytecode\n// Executed by launching: java Main\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Running on JVM!");\n    }\n}',
      takeaways: [
        'JVM is platform-dependent (different installers for Windows, MacOS, Linux).',
        'Responsible for memory management, thread handling, and garbage collection.'
      ]
    },
    'Platform Independent': {
      explanation: 'Java is platform-independent because the compiler converts source code (.java) into intermediate bytecode (.class) which can be run on any platform possessing a JVM.',
      code: '[Main.java] -> Compile (javac) -> [Main.class] (Bytecode)\n[Main.class] -> Executed by JVM on Windows, Mac, or Linux.',
      takeaways: [
        'Enables Java\'s core design philosophy: "Write Once, Run Anywhere" (WORA).',
        'Bytecode files are highly portable and sandboxed, offering good security.'
      ]
    },
    'Classes': {
      explanation: 'Everything in Java is associated with classes and objects. A class is a template or blueprint for creating objects, and Java requires all code to belong to a class.',
      code: 'public class User {\n    private String username;\n    public User(String username) {\n        this.username = username;\n    }\n    public void printName() {\n        System.out.println(username);\n    }\n}',
      takeaways: [
        'The main class in a file must exactly match the file name (e.g., User.java).',
        'Encourages object-oriented design and modular structures.'
      ]
    },
    'Inheritance': {
      explanation: 'Inheritance is Java\'s mechanism to inherit fields and methods from a superclass (parent) to a subclass (child) using the extends keyword.',
      code: 'class Person {\n    protected String name = "Bob";\n}\n\nclass Teacher extends Person {\n    private String subject = "Math";\n    public void display() {\n        System.out.println(name + " teaches " + subject);\n    }\n}',
      takeaways: [
        'To prevent ambiguity, Java does not support multiple inheritance with classes.',
        'Subclasses can override superclass methods using the @Override annotation.'
      ]
    },
    'Exception Handling': {
      explanation: 'Exception handling is a mechanism in Java to handle runtime errors (such as ArithmeticException, NullPointerException, etc.) to ensure the program flow is maintained.',
      code: 'try {\n    int data = 100 / 0; // Throws ArithmeticException\n} catch (ArithmeticException e) {\n    System.out.println("Cannot divide by zero!");\n} finally {\n    System.out.println("Finally code always executes.");\n}',
      takeaways: [
        'Uses five keywords: try, catch, finally, throw, and throws.',
        'Exceptions are categorized into Checked (compile-time) and Unchecked (runtime).'
      ]
    }
  },
  Python: {
    'Introduction': {
      explanation: 'Python is a high-level, interpreted programming language famous for its simple, readable syntax, high efficiency, and dynamic typing.',
      code: '# Printing a greeting\nname = "World"\nprint(f"Hello, {name}!")\n\n# Dynamic variable assignment\nx = 10\nx = "Ten" # Valid in Python',
      takeaways: [
        'Uses whitespace indentation instead of curly braces to define blocks of code.',
        'An interpreted language (no compile step required to run scripts).'
      ]
    },
    'Lists': {
      explanation: 'A list is an ordered, mutable, and indexable collection in Python. Lists can contain items of different data types and support dynamic resizing.',
      code: 'fruits = ["apple", "banana", "cherry"]\nfruits.append("orange") # Add element\n\n# List comprehension\nsquared = [x**2 for x in range(5)] # Output: [0, 1, 4, 9, 16]',
      takeaways: [
        'Lists are zero-indexed and support negative indices (e.g., -1 is the last item).',
        'Very versatile, supporting slicing, copying, sorting, and nesting.'
      ]
    },
    'Functions': {
      explanation: 'Functions in Python are defined using the def keyword. They can accept default values, keyword arguments, and support multiple return values.',
      code: 'def greet(name, message="Hello"):\n    return f"{message}, {name}!"\n\n# Calling the function\nprint(greet("Alice")) # Output: Hello, Alice!',
      takeaways: [
        'Can return multiple values simultaneously as a tuple (e.g., return a, b).',
        'Supports lambda expressions for quick, single-line anonymous functions.'
      ]
    },
    'Dictionaries': {
      explanation: 'A dictionary is a mutable collection of key-value pairs in Python. Keys must be unique and immutable data types (like strings, integers, or tuples).',
      code: 'user = {\n    "username": "coder123",\n    "score": 95,\n    "active": True\n}\n\n# Accessing a value\nprint(user["username"]) # coder123\n\n# Safe access using get()\nprint(user.get("email", "Not Found"))',
      takeaways: [
        'Keys are mapped to values using hash tables, allowing extremely fast lookups.',
        'Accessing a key that doesn\'t exist directly raises a KeyError; use get() to avoid this.'
      ]
    },
    'OOP': {
      explanation: 'Python supports Object-Oriented Programming (OOP). Classes are defined using the class keyword, and instance methods accept self as the first parameter.',
      code: 'class Dog:\n    def __init__(self, name):\n        self.name = name # Instance variable\n    def bark(self): \n        return f"{self.name} says Woof!"\n\nmy_dog = Dog("Rex")\nprint(my_dog.bark())',
      takeaways: [
        '__init__() acts as the constructor and initializes class instance properties.',
        'Python supports single, multiple, multilevel, and hierarchical inheritance.'
      ]
    }
  }
};

export default function Notes() {
  const { isDark, colors } = useTheme();
  const styles = getStyles(colors);
  const params = useLocalSearchParams();
  const langParam = typeof params.lang === 'string' ? params.lang : '';

  const [selectedLang, setSelectedLang] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [myNote, setMyNote] = useState('');
  const [savedNotes, setSavedNotes] = useState<PersonalNote[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPredefinedNote, setSelectedPredefinedNote] = useState<any>(null);

  const languages = ['C', 'Cpp', 'Java', 'Python'];

  const langMeta: { [key: string]: { name: string; icon: string; accent: string } } = {
    C: { name: 'C', icon: 'code-slash-outline', accent: '#0284c7' },
    Cpp: { name: 'C++', icon: 'settings-outline', accent: '#7c3aed' },
    Java: { name: 'Java', icon: 'cafe-outline', accent: '#ea580c' },
    Python: { name: 'Python', icon: 'logo-python', accent: '#ca8a04' }
  };

  const predefinedNotes: any = {
    C: [
      {
        title: 'Variables',
        content: 'Variables store data values in memory.',
      },
      {
        title: 'Data Types',
        content: 'C supports int, float, char, double etc.',
      },
      {
        title: 'Loops',
        content: 'Loops repeat statements multiple times.',
      },
      {
        title: 'Arrays',
        content: 'Arrays store multiple values of same type.',
      },
      {
        title: 'Functions',
        content: 'Functions are reusable blocks of code.',
      },
    ],

    Cpp: [
      {
        title: 'OOP',
        content: 'C++ supports Object Oriented Programming.',
      },
      {
        title: 'Classes & Objects',
        content: 'Classes are blueprints for objects.',
      },
      {
        title: 'Inheritance',
        content: 'Inheritance allows code reusability.',
      },
      {
        title: 'Polymorphism',
        content: 'Polymorphism allows multiple forms.',
      },
      {
        title: 'Constructors',
        content: 'Constructors initialize objects.',
      },
    ],

    Java: [
      {
        title: 'JVM',
        content: 'Java code runs on Java Virtual Machine.',
      },
      {
        title: 'Platform Independent',
        content: 'Java follows Write Once Run Anywhere.',
      },
      {
        title: 'Classes',
        content: 'Java programs are based on classes.',
      },
      {
        title: 'Inheritance',
        content: 'Inheritance helps reuse code.',
      },
      {
        title: 'Exception Handling',
        content: 'Exceptions handle runtime errors.',
      },
    ],

    Python: [
      {
        title: 'Introduction',
        content: 'Python is easy and beginner friendly.',
      },
      {
        title: 'Lists',
        content: 'Lists store multiple values.',
      },
      {
        title: 'Functions',
        content: 'Functions organize reusable code.',
      },
      {
        title: 'Dictionaries',
        content: 'Dictionaries store key-value pairs.',
      },
      {
        title: 'OOP',
        content: 'Python also supports OOP concepts.',
      },
    ],
  };

  // Clear search when language changes
  useEffect(() => {
    setSearchQuery('');
  }, [selectedLang]);

  // Handle route params
  useEffect(() => {
    if (langParam) {
      const mapped = langParam === 'C++' ? 'Cpp' : langParam;
      if (languages.includes(mapped)) {
        setSelectedLang(mapped);
      }
    } else {
      // Default to C if none selected
      setSelectedLang('C');
    }
  }, [langParam]);

  // Load notes on mount
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const res = await fetch(`${API_URL}/api/notes`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((note: any) => ({
            id: note._id,
            lang: note.lang,
            title: note.title,
            content: note.content,
            createdAt: note.createdAtString
          }));
          setSavedNotes(mapped);
          await AsyncStorage.setItem('@learn2code_personal_notes', JSON.stringify(mapped));
          return;
        }
      }
    } catch (e) {
      console.log('Failed to fetch from backend, trying local storage...', e);
    }

    // Fallback
    try {
      const stored = await AsyncStorage.getItem('@learn2code_personal_notes');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const migrated = parsed.map((item: any, idx) => {
            if (typeof item === 'string') {
              return {
                id: `legacy-${idx}-${Date.now()}`,
                lang: 'C',
                title: 'Note',
                content: item,
                createdAt: new Date().toLocaleDateString(),
              };
            }
            return item;
          });
          setSavedNotes(migrated);
        }
      }
    } catch (e) {
      console.log('Failed to load notes', e);
    }
  };

  const handleSaveNote = async () => {
    if (myNote.trim() === '') {
      alert('Note content cannot be empty.');
      return;
    }

    const langKey = selectedLang;
    const now = new Date().toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        if (editingNoteId && !editingNoteId.startsWith('note-')) {
          // Sync update with backend
          const res = await fetch(`${API_URL}/api/notes/${editingNoteId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              title: noteTitle.trim() || 'Untitled Note',
              content: myNote.trim(),
              createdAtString: now + ' (Edited)'
            })
          });

          if (res.ok) {
            const updatedNote = await res.json();
            const updated = savedNotes.map(note => {
              if (note.id === editingNoteId) {
                return {
                  ...note,
                  title: updatedNote.title,
                  content: updatedNote.content,
                  createdAt: updatedNote.createdAtString
                };
              }
              return note;
            });
            setSavedNotes(updated);
            await AsyncStorage.setItem('@learn2code_personal_notes', JSON.stringify(updated));
            setEditingNoteId(null);
            setNoteTitle('');
            setMyNote('');
            return;
          }
        } else {
          // Sync create with backend
          const res = await fetch(`${API_URL}/api/notes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              lang: langKey,
              title: noteTitle.trim() || 'Untitled Note',
              content: myNote.trim(),
              createdAtString: now
            })
          });

          if (res.ok) {
            const newNote = await res.json();
            const mappedNote: PersonalNote = {
              id: newNote._id,
              lang: newNote.lang,
              title: newNote.title,
              content: newNote.content,
              createdAt: newNote.createdAtString
            };
            const updated = [...savedNotes, mappedNote];
            setSavedNotes(updated);
            await AsyncStorage.setItem('@learn2code_personal_notes', JSON.stringify(updated));
            setNoteTitle('');
            setMyNote('');
            return;
          }
        }
      }
    } catch (e) {
      console.log('Backend sync failed, saving locally', e);
    }

    // Local Fallback if offline/unauthorized
    const tempId = editingNoteId || `note-${Date.now()}`;
    let updated: PersonalNote[];
    if (editingNoteId) {
      updated = savedNotes.map(note => {
        if (note.id === editingNoteId) {
          return {
            ...note,
            title: noteTitle.trim() || 'Untitled Note',
            content: myNote.trim(),
            createdAt: now + ' (Edited)'
          };
        }
        return note;
      });
      setEditingNoteId(null);
    } else {
      const newNote: PersonalNote = {
        id: tempId,
        lang: langKey,
        title: noteTitle.trim() || 'Untitled Note',
        content: myNote.trim(),
        createdAt: now
      };
      updated = [...savedNotes, newNote];
    }

    setSavedNotes(updated);
    await AsyncStorage.setItem('@learn2code_personal_notes', JSON.stringify(updated));

    // Reset input fields
    setNoteTitle('');
    setMyNote('');
  };

  const handleStartEdit = (note: PersonalNote) => {
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setMyNote(note.content);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setNoteTitle('');
    setMyNote('');
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token && !id.startsWith('note-')) {
        const res = await fetch(`${API_URL}/api/notes/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          console.log('Note deleted on backend');
        }
      }
    } catch (e) {
      console.log('Backend delete failed, removing locally only', e);
    }

    const updated = savedNotes.filter(note => note.id !== id);
    setSavedNotes(updated);
    await AsyncStorage.setItem('@learn2code_personal_notes', JSON.stringify(updated));
    if (editingNoteId === id) {
      handleCancelEdit();
    }
  };

  // Filter notes — lang comparison is case-insensitive to handle any storage inconsistencies
  const q = searchQuery.trim().toLowerCase();

  const filteredPredefined = (predefinedNotes[selectedLang] || []).filter((note: any) =>
    q === '' ||
    note.title.toLowerCase().includes(q) ||
    note.content.toLowerCase().includes(q)
  );

  const filteredPersonal = savedNotes.filter((note: PersonalNote) => {
    // Normalise lang: treat 'Cpp'/'cpp'/'C++' all as same, etc.
    const normNoteLang = note.lang?.trim().toLowerCase().replace('c++', 'cpp');
    const normSelectedLang = selectedLang?.trim().toLowerCase().replace('c++', 'cpp');
    if (normNoteLang !== normSelectedLang) return false;
    if (q === '') return true;
    return (
      note.title.toLowerCase().includes(q) ||
      note.content.toLowerCase().includes(q)
    );
  });

  return (
    <LinearGradient colors={isDark ? ['#0b0f19', '#1e293b'] : ['#f8fafc', '#f1f5f9']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>📚 Interactive Notes</Text>
            <Text style={styles.headerSub}>Read predefined syntax notes and write your personal logs</Text>
          </View>
        </View>

        {/* Language Pills Selector */}
        <View style={styles.langSelectorContainer}>
          <Text style={styles.selectorLabel}>Select Language:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.langPillsScroll}>
            {languages.map((langKey) => {
              const isSelected = selectedLang === langKey;
              const meta = langMeta[langKey];
              return (
                <TouchableOpacity
                  key={langKey}
                  style={[
                    styles.langPill,
                    isSelected && {
                      backgroundColor: meta.accent,
                      borderColor: meta.accent,
                      shadowColor: meta.accent,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 6,
                      elevation: 4,
                    }
                  ]}
                  onPress={() => {
                    setSelectedLang(langKey);
                    setSearchQuery('');
                  }}
                >
                  <Ionicons
                    name={meta.icon as any}
                    size={18}
                    color={isSelected ? '#ffffff' : colors.textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.langPillText, isSelected && styles.langPillTextActive]}>
                    {meta.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Selected Language Content */}
        {selectedLang !== '' && (
          <View>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={20} color={colors.textSecondary} style={styles.searchIcon} />
              <TextInput
                placeholder={`Search ${langMeta[selectedLang].name} notes...`}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
                placeholderTextColor={colors.placeholderText}
              />
              {searchQuery !== '' && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* PREDEFINED NOTES */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="bookmarks-outline" size={20} color={langMeta[selectedLang].accent} />
                <Text style={styles.sectionTitle}>Predefined Notes</Text>
              </View>
              <Text style={styles.sectionBadge}>{filteredPredefined.length} Items</Text>
            </View>

            {filteredPredefined.length === 0 ? (
              <View style={styles.emptySearchResults}>
                <Text style={styles.emptySearchText}>No matching predefined notes found.</Text>
              </View>
            ) : (
              filteredPredefined.map((item: any, i: number) => (
                <TouchableOpacity
                  key={i}
                  style={styles.noteCard}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedPredefinedNote(item);
                    setDetailModalVisible(true);
                  }}
                >
                  <View style={[styles.cardAccentBar, { backgroundColor: langMeta[selectedLang].accent }]} />
                  <View style={styles.noteCardContent}>
                    <View style={styles.noteCardHeader}>
                      <Text style={styles.noteTitle}>{item.title}</Text>
                      <View style={[styles.tagBadge, { backgroundColor: langMeta[selectedLang].accent + '15' }]}>
                        <Text style={[styles.tagBadgeText, { color: langMeta[selectedLang].accent }]}>
                          {selectedLang === 'Cpp' ? 'C++' : selectedLang} Syntax
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.noteContent}>{item.content}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}

            {/* PERSONAL NOTES */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="create-outline" size={20} color={langMeta[selectedLang].accent} />
                <Text style={styles.sectionTitle}>My Personal Notes</Text>
              </View>
              <Text style={styles.sectionBadge}>{filteredPersonal.length} Saved</Text>
            </View>

            {/* Saved Personal Notes List — shown first when searching */}
            {q !== '' && (
              filteredPersonal.length === 0 ? (
                <View style={styles.emptyPersonalState}>
                  <Ionicons name="search-outline" size={36} color={colors.border} style={{ marginBottom: 8 }} />
                  <Text style={styles.emptyPersonalTitle}>No personal notes match</Text>
                  <Text style={styles.emptyPersonalSub}>Try a different keyword or clear the search</Text>
                </View>
              ) : (
                filteredPersonal.map((note) => (
                  <View key={note.id} style={styles.personalCard}>
                    <View style={styles.personalHeader}>
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text style={styles.personalTitle}>{note.title}</Text>
                        <Text style={styles.personalTime}>{note.createdAt}</Text>
                      </View>
                      <View style={styles.actionButtonContainer}>
                        <TouchableOpacity
                          style={styles.actionBtnIcon}
                          onPress={() => handleStartEdit(note)}
                        >
                          <Ionicons name="pencil-outline" size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionBtnIcon, { marginLeft: 8 }]}
                          onPress={() => handleDeleteNote(note.id)}
                        >
                          <Ionicons name="trash-outline" size={18} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={styles.personalContent}>{note.content}</Text>
                  </View>
                ))
              )
            )}

            {/* Add/Edit Form Card — hidden while searching so results are front and centre */}
            {q === '' && (
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>
                  {editingNoteId ? '✏️ Edit Note' : '📝 Add New Note'}
                </Text>

                <TextInput
                  placeholder="Note Title (e.g., Memory Management)"
                  value={noteTitle}
                  onChangeText={setNoteTitle}
                  style={styles.titleInput}
                  placeholderTextColor={colors.placeholderText}
                />

                <TextInput
                  placeholder="Write your notes here... (supports multiline)"
                  multiline
                  value={myNote}
                  onChangeText={setMyNote}
                  style={styles.contentInput}
                  placeholderTextColor={colors.placeholderText}
                />

                <View style={styles.formButtonRow}>
                  {editingNoteId && (
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={handleCancelEdit}
                    >
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[
                      styles.saveBtn,
                      { backgroundColor: langMeta[selectedLang].accent }
                    ]}
                    onPress={handleSaveNote}
                  >
                    <Ionicons name={editingNoteId ? "checkmark" : "add"} size={18} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.saveText}>
                      {editingNoteId ? 'Update Note' : 'Save Note'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* All personal notes list — shown when NOT searching */}
            {q === '' && (
              savedNotes.filter((note: PersonalNote) => {
                const normNoteLang = note.lang?.trim().toLowerCase().replace('c++', 'cpp');
                const normSelectedLang = selectedLang?.trim().toLowerCase().replace('c++', 'cpp');
                return normNoteLang === normSelectedLang;
              }).length === 0 ? (
                <View style={styles.emptyPersonalState}>
                  <Ionicons name="document-text-outline" size={40} color={colors.border} style={{ marginBottom: 8 }} />
                  <Text style={styles.emptyPersonalTitle}>No personal notes yet</Text>
                  <Text style={styles.emptyPersonalSub}>Jot down your learnings in the form above!</Text>
                </View>
              ) : (
                savedNotes
                  .filter((note: PersonalNote) => {
                    const normNoteLang = note.lang?.trim().toLowerCase().replace('c++', 'cpp');
                    const normSelectedLang = selectedLang?.trim().toLowerCase().replace('c++', 'cpp');
                    return normNoteLang === normSelectedLang;
                  })
                  .map((note) => (
                    <View key={note.id} style={styles.personalCard}>
                      <View style={styles.personalHeader}>
                        <View style={{ flex: 1, paddingRight: 10 }}>
                          <Text style={styles.personalTitle}>{note.title}</Text>
                          <Text style={styles.personalTime}>{note.createdAt}</Text>
                        </View>
                        <View style={styles.actionButtonContainer}>
                          <TouchableOpacity
                            style={styles.actionBtnIcon}
                            onPress={() => handleStartEdit(note)}
                          >
                            <Ionicons name="pencil-outline" size={18} color={colors.textSecondary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.actionBtnIcon, { marginLeft: 8 }]}
                            onPress={() => handleDeleteNote(note.id)}
                          >
                            <Ionicons name="trash-outline" size={18} color="#ef4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Text style={styles.personalContent}>{note.content}</Text>
                    </View>
                  ))
              )
            )}
          </View>
        )}
      </ScrollView>

      {/* Detailed Predefined Note Modal */}
      <Modal
        visible={detailModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.detailModalOverlay}>
          <View style={styles.detailModalContent}>
            {selectedLang !== '' && (
              <LinearGradient
                colors={[langMeta[selectedLang].accent, langMeta[selectedLang].accent + 'E0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalHeaderGradient}
              >
                <View style={styles.modalHeaderRow}>
                  <Text style={styles.modalHeaderTitle}>{selectedPredefinedNote?.title}</Text>
                  <TouchableOpacity
                    style={styles.modalCloseBtnIcon}
                    onPress={() => setDetailModalVisible(false)}
                  >
                    <Ionicons name="close" size={24} color="#ffffff" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalHeaderSub}>
                  {selectedLang === 'Cpp' ? 'C++' : selectedLang} Predefined Concept
                </Text>
              </LinearGradient>
            )}

            <ScrollView style={styles.modalBodyScroll} contentContainerStyle={styles.modalBodyContent} showsVerticalScrollIndicator={false}>
              {selectedPredefinedNote && selectedLang && predefinedDetails[selectedLang]?.[selectedPredefinedNote.title] ? (
                <View style={styles.modalDetailsContainer}>
                  {/* Explanation Section */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>💡 Concept Explanation</Text>
                    <Text style={styles.detailText}>
                      {predefinedDetails[selectedLang][selectedPredefinedNote.title].explanation}
                    </Text>
                  </View>

                  {/* Code Block Section */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>💻 Code Example</Text>
                    <View style={styles.modalCodeBox}>
                      <Text style={styles.modalCodeText}>
                        {predefinedDetails[selectedLang][selectedPredefinedNote.title].code}
                      </Text>
                    </View>
                  </View>

                  {/* Takeaways Section */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>📌 Key Takeaways</Text>
                    {predefinedDetails[selectedLang][selectedPredefinedNote.title].takeaways.map((takeaway, idx) => (
                      <View key={idx} style={styles.takeawayRow}>
                        <Text style={[styles.takeawayDot, { color: langMeta[selectedLang].accent }]}>•</Text>
                        <Text style={styles.takeawayText}>{takeaway}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : (
                <View style={styles.modalDetailsContainer}>
                  <Text style={styles.detailText}>
                    {selectedPredefinedNote?.content}
                  </Text>
                </View>
              )}
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.closeFooterBtn,
                  selectedLang !== '' && { backgroundColor: langMeta[selectedLang].accent }
                ]}
                onPress={() => setDetailModalVisible(false)}
              >
                <Text style={styles.closeFooterBtnText}>Got It!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: colors.textSecondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSub: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  langSelectorContainer: {
    marginBottom: 25,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 10,
  },
  langPillsScroll: {
    paddingVertical: 5,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 10,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  langPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  langPillTextActive: {
    color: '#ffffff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.textSecondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.inputText,
    ...({ outlineStyle: 'none', outline: 'none', boxShadow: 'none', border: 'none', WebkitAppearance: 'none' } as any),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  sectionBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    backgroundColor: colors.inputBg,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  cardAccentBar: {
    width: 6,
  },
  noteCardContent: {
    flex: 1,
    padding: 16,
  },
  noteCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  tagBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  tagBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  noteContent: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  titleInput: {
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    color: colors.inputText,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contentInput: {
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    color: colors.inputText,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: colors.inputBg,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  saveBtn: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptySearchResults: {
    padding: 25,
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 16,
    marginBottom: 20,
  },
  emptySearchText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  emptyPersonalState: {
    padding: 35,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    marginBottom: 20,
  },
  emptyPersonalTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 10,
  },
  emptyPersonalSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  personalCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  personalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  personalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  personalTime: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  personalContent: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  actionButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtnIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 9999,
  },
  detailModalContent: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    width: '100%',
    maxWidth: 700,
    maxHeight: '85%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  modalHeaderGradient: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 18,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalHeaderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  modalHeaderSub: {
    fontSize: 13,
    color: '#f1f5f9',
    opacity: 0.9,
    marginTop: 4,
  },
  modalCloseBtnIcon: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  modalBodyScroll: {
    flex: 1,
  },
  modalBodyContent: {
    padding: 24,
  },
  modalDetailsContainer: {
    gap: 20,
  },
  detailSection: {
    marginBottom: 8,
  },
  detailSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  modalCodeBox: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  modalCodeText: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#34d399',
    lineHeight: 20,
  },
  takeawayRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  takeawayDot: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    lineHeight: 20,
  },
  takeawayText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  modalFooter: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeFooterBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeFooterBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});