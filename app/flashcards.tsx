import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  useWindowDimensions,
  Linking,
  TextInput,
  Pressable,
  Platform,
  Modal,
  Image,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Path,
  Circle,
  Text as SvgText,
  Rect,
  G,
} from 'react-native-svg';

const flashcardData = {
  'C': [
    {
      question: 'Why is printf() used in C?',
      answer: 'printf() is used to display output on the screen.',
      code: 'printf("Hello World");',
      link: 'https://www.geeksforgeeks.org/printf-in-c/'
    },
    {
      question: 'Why is scanf() used in C?',
      answer: 'scanf() is used to take user input.',
      code: 'scanf("%d", &a);',
      link: 'https://www.geeksforgeeks.org/all-forms-of-formatted-scanf-in-c/'
    },
    {
      question: 'What is int data type?',
      answer: 'int stores whole numbers.',
      code: 'int age = 20;',
      link: 'https://www.geeksforgeeks.org/c-data-types/'
    },
    {
      question: 'What is array in C?',
      answer: 'An array stores multiple values of the same type.',
      code: 'int arr[5] = {1, 2, 3, 4, 5};',
      link: 'https://www.geeksforgeeks.org/c-arrays/'
    },
    {
      question: 'What is pointer in C?',
      answer: 'A pointer stores the memory address of another variable.',
      code: 'int *ptr = &a;',
      link: 'https://www.geeksforgeeks.org/pointers-in-c-and-c-set-1-introduction-arithmetic-and-array/'
    },
    {
      question: 'What is modulus operator?',
      answer: 'The modulus operator (%) returns the remainder after division.',
      code: 'int mod = a % b;',
      link: 'https://www.geeksforgeeks.org/modulo-operator-in-c-cpp/'
    },
    {
      question: 'What is float?',
      answer: 'float stores decimal numbers.',
      code: 'float price = 99.99;',
      link: 'https://www.geeksforgeeks.org/c-data-types/'
    },
    {
      question: 'What is char?',
      answer: 'char stores a single character.',
      code: "char grade = 'A';",
      link: 'https://www.geeksforgeeks.org/c-data-types/'
    },
    {
      question: 'Why is if statement used?',
      answer: 'if is used for decision making.',
      code: 'if(a > b) { printf("A"); }',
      link: 'https://www.geeksforgeeks.org/c-if-else-statement/'
    },
    {
      question: 'What is a for loop?',
      answer: 'A for loop repeats code multiple times.',
      code: 'for(int i=0;i<5;i++)',
      link: 'https://www.geeksforgeeks.org/c-for-loop/'
    },
    {
      question: 'What is a function?',
      answer: 'A function is a reusable block of code that performs a specific task.',
      code: 'int add(int a,int b){ return a+b; }',
      link: 'https://www.geeksforgeeks.org/functions-in-c/'
    },
    {
      question: 'Why is return statement used?',
      answer: 'The return statement sends a value back from a function.',
      code: 'return 0;',
      link: 'https://www.geeksforgeeks.org/return-statement-in-c/'
    },
    {
      question: 'What is sizeof() operator?',
      answer: 'sizeof() returns the size of a data type or variable in bytes.',
      code: 'printf("%d", sizeof(int));',
      link: 'https://www.geeksforgeeks.org/sizeof-operator-c/'
    },
    {
      question: 'What is a while loop?',
      answer: 'A while loop repeats a block of code while a condition remains true.',
      code: 'while(i < 5){ i++; }',
      link: 'https://www.geeksforgeeks.org/c-while-loop/'
    },
    {
      question: 'What is a do-while loop?',
      answer: 'A do-while loop executes at least once before checking the condition.',
      code: 'do{ i++; }while(i<5);',
      link: 'https://www.geeksforgeeks.org/c-do-while-loop/'
    },
    {
      question: 'What is a structure?',
      answer: 'A structure groups different types of variables under one name.',
      code: 'struct Student { int id; char name[20]; };',
      link: 'https://www.geeksforgeeks.org/structures-c/'
    },
    {
      question: 'What is a string in C?',
      answer: 'A string is a sequence of characters ending with a null character.',
      code: 'char name[] = "Annu";',
      link: 'https://www.geeksforgeeks.org/strings-in-c-2/'
    },
    {
      question: 'What is break statement?',
      answer: 'break is used to immediately exit a loop or switch statement.',
      code: 'if(i==5) break;',
      link: 'https://www.geeksforgeeks.org/c-break-statement/'
    },
    {
      question: 'What is continue statement?',
      answer: 'continue skips the current iteration and moves to the next iteration.',
      code: 'if(i==5) continue;',
      link: 'https://www.geeksforgeeks.org/c-continue-statement/'
    },
    {
      question: 'What is switch statement?',
      answer: 'switch is used for multiple condition selection.',
      code: 'switch(choice){ case 1: break; }',
      link: 'https://www.geeksforgeeks.org/switch-statement-cc/'
    },
    {
      question: 'What is a nested loop?',
      answer: 'A nested loop is a loop inside another loop.',
      code: 'for(i=0;i<3;i++){ for(j=0;j<3;j++){} }',
      link: 'https://www.geeksforgeeks.org/nested-loops-in-c-with-examples/'
    },
    {
      question: 'What is recursion?',
      answer: 'Recursion is a technique where a function calls itself.',
      code: 'factorial(n-1);',
      link: 'https://www.geeksforgeeks.org/c-recursion/'
    },
    {
      question: 'What is dynamic memory allocation?',
      answer: 'Dynamic memory allocation allocates memory during program execution.',
      code: 'ptr = (int*)malloc(sizeof(int));',
      link: 'https://www.geeksforgeeks.org/dynamic-memory-allocation-in-c-using-malloc-calloc-free-and-realloc/'
    },
    {
      question: 'What is a file in C?',
      answer: 'Files are used to store data permanently on secondary storage.',
      code: 'FILE *fp = fopen("data.txt","r");',
      link: 'https://www.geeksforgeeks.org/basics-file-handling-c/'
    },
  ],
  'C++': [
    {
      question: 'Why is cout used?',
      answer: 'cout is used to display output.',
      code: 'cout << "Hello World";',
      link: 'https://www.geeksforgeeks.org/cout-standard-output-stream-object-in-cpp/'
    },
    {
      question: 'Why is cin used?',
      answer: 'cin is used to take input.',
      code: 'cin >> age;',
      link: 'https://www.geeksforgeeks.org/cin-in-c/'
    },
    {
      question: 'What is a class?',
      answer: 'A class is a blueprint for objects.',
      code: 'class Student { };',
      link: 'https://www.geeksforgeeks.org/c-classes-and-objects/'
    },
    {
      question: 'What is an object?',
      answer: 'An object is an instance of a class.',
      code: 'Student s1;',
      link: 'https://www.geeksforgeeks.org/c-classes-and-objects/'
    },
    {
      question: 'What is inheritance?',
      answer: 'Inheritance allows code reuse.',
      code: 'class Child : public Parent { };',
      link: 'https://www.geeksforgeeks.org/inheritance-in-c/'
    },
    {
      question: 'What is polymorphism?',
      answer: 'Polymorphism means many forms.',
      code: 'virtual void display();',
      link: 'https://www.geeksforgeeks.org/polymorphism-in-c/'
    },
    {
      question: 'What is encapsulation?',
      answer: 'Encapsulation binds data and methods together.',
      code: 'private: int age;',
      link: 'https://www.geeksforgeeks.org/encapsulation-in-c/'
    },
    {
      question: 'What is a vector?',
      answer: 'Vector is a dynamic array in C++.',
      code: 'vector<int> nums;',
      link: 'https://www.geeksforgeeks.org/vector-in-cpp-stl/'
    },
    {
      question: 'What is a constructor?',
      answer: 'A constructor initializes an object when it is created.',
      code: 'Student() { }',
      link: 'https://www.geeksforgeeks.org/constructors-c/'
    },
    {
      question: 'What is a destructor?',
      answer: 'A destructor is called when an object is destroyed.',
      code: '~Student() { }',
      link: 'https://www.geeksforgeeks.org/destructors-c/'
    },
    {
      question: 'What is function overloading?',
      answer: 'Function overloading allows multiple functions with the same name but different parameters.',
      code: 'int add(int a,int b);',
      link: 'https://www.geeksforgeeks.org/function-overloading-c/'
    },
    {
      question: 'What is operator overloading?',
      answer: 'Operator overloading allows operators to work with user-defined types.',
      code: 'Complex operator +(Complex c);',
      link: 'https://www.geeksforgeeks.org/operator-overloading-c/'
    },
    {
      question: 'What is abstraction?',
      answer: 'Abstraction hides implementation details.',
      code: 'virtual void show() = 0;',
      link: 'https://www.geeksforgeeks.org/abstraction-in-c/'
    },
    {
      question: 'What is a friend function?',
      answer: 'A friend function can access private members of a class.',
      code: 'friend void display(Student s);',
      link: 'https://www.geeksforgeeks.org/friend-class-function-cpp/'
    },
    {
      question: 'What is a namespace?',
      answer: 'A namespace prevents naming conflicts.',
      code: 'using namespace std;',
      link: 'https://www.geeksforgeeks.org/namespace-in-c/'
    },
    {
      question: 'What is a template?',
      answer: 'Templates allow generic programming.',
      code: 'template <class T>',
      link: 'https://www.geeksforgeeks.org/templates-cpp/'
    },
    {
      question: 'What is STL?',
      answer: 'STL stands for Standard Template Library.',
      code: 'vector<int> v;',
      link: 'https://www.geeksforgeeks.org/the-c-standard-template-library-stl/'
    },
    {
      question: 'What is a stack?',
      answer: 'Stack follows Last In First Out (LIFO).',
      code: 'stack<int> s;',
      link: 'https://www.geeksforgeeks.org/stack-in-cpp-stl/'
    },
    {
      question: 'What is a queue?',
      answer: 'Queue follows First In First Out (FIFO).',
      code: 'queue<int> q;',
      link: 'https://www.geeksforgeeks.org/queue-cpp-stl/'
    },
    {
      question: 'What is a map?',
      answer: 'Map stores key-value pairs.',
      code: 'map<string,int> marks;',
      link: 'https://www.geeksforgeeks.org/map-associative-containers-the-c-standard-template-library-stl/'
    },
  ],
  'Java': [
    {
      question: 'Why is System.out.println() used?',
      answer: 'It is used to display output.',
      code: 'System.out.println("Hello World");',
      link: 'https://www.geeksforgeeks.org/system-out-println-in-java/'
    },
    {
      question: 'Why is Scanner used?',
      answer: 'Scanner is used for user input.',
      code: 'Scanner sc = new Scanner(System.in);',
      link: 'https://www.geeksforgeeks.org/scanner-class-in-java/'
    },
    {
      question: 'What is JVM?',
      answer: 'JVM stands for Java Virtual Machine.',
      code: 'java MyProgram',
      link: 'https://www.geeksforgeeks.org/jvm-works-jvm-architecture/'
    },
    {
      question: 'What is JDK?',
      answer: 'JDK stands for Java Development Kit.',
      code: 'javac MyProgram.java',
      link: 'https://www.geeksforgeeks.org/jdk-in-java/'
    },
    {
      question: 'What is JRE?',
      answer: 'JRE stands for Java Runtime Environment.',
      code: 'java MyProgram',
      link: 'https://www.geeksforgeeks.org/difference-between-jdk-jre-and-jvm/'
    },
    {
      question: 'What is a class?',
      answer: 'A class is a blueprint for objects.',
      code: 'class Student { }',
      link: 'https://www.geeksforgeeks.org/classes-objects-java/'
    },
    {
      question: 'What is inheritance?',
      answer: 'Inheritance allows one class to acquire another class properties.',
      code: 'class Child extends Parent { }',
      link: 'https://www.geeksforgeeks.org/inheritance-in-java/'
    },
    {
      question: 'What is ArrayList?',
      answer: 'ArrayList is a dynamic array.',
      code: 'ArrayList<String> list = new ArrayList<>();',
      link: 'https://www.geeksforgeeks.org/arraylist-in-java/'
    },
    {
      question: 'What is an object?',
      answer: 'An object is an instance of a class.',
      code: 'Student s1 = new Student();',
      link: 'https://www.geeksforgeeks.org/classes-objects-java/'
    },
    {
      question: 'What is a constructor?',
      answer: 'A constructor initializes objects.',
      code: 'Student() { }',
      link: 'https://www.geeksforgeeks.org/constructors-in-java/'
    },
    {
      question: 'What is method overloading?',
      answer: 'Method overloading allows multiple methods with the same name but different parameters.',
      code: 'void add(int a)\nvoid add(int a, int b)',
      link: 'https://www.geeksforgeeks.org/method-overloading-in-java/'
    },
    {
      question: 'What is method overriding?',
      answer: 'Method overriding allows a subclass to provide its own implementation.',
      code: '@Override\nvoid display() { }',
      link: 'https://www.geeksforgeeks.org/method-overriding-in-java/'
    },
    {
      question: 'What is encapsulation?',
      answer: 'Encapsulation binds data and methods together.',
      code: 'private int age;',
      link: 'https://www.geeksforgeeks.org/encapsulation-in-java/'
    },
    {
      question: 'What is polymorphism?',
      answer: 'Polymorphism allows one interface to have many forms.',
      code: 'Parent p = new Child();',
      link: 'https://www.geeksforgeeks.org/polymorphism-in-java/'
    },
    {
      question: 'What is abstraction?',
      answer: 'Abstraction hides implementation details.',
      code: 'abstract class Shape { }',
      link: 'https://www.geeksforgeeks.org/abstraction-in-java-2/'
    },
    {
      question: 'What is an interface?',
      answer: 'An interface contains abstract methods.',
      code: 'interface Animal { void sound(); }',
      link: 'https://www.geeksforgeeks.org/interfaces-in-java/'
    },
    {
      question: 'What is exception handling?',
      answer: 'Exception handling manages runtime errors.',
      code: 'try { } catch(Exception e) { }',
      link: 'https://www.geeksforgeeks.org/exceptions-in-java/'
    },
    {
      question: 'What is a package?',
      answer: 'A package groups related classes.',
      code: 'package mypackage;',
      link: 'https://www.geeksforgeeks.org/packages-in-java/'
    },
    {
      question: 'What is String class?',
      answer: 'String is used to store text.',
      code: 'String name = "Annu";',
      link: 'https://www.geeksforgeeks.org/string-class-in-java/'
    },
    {
      question: 'What is a loop in Java?',
      answer: 'Loops execute a block of code repeatedly.',
      code: 'for(int i=0;i<5;i++)',
      link: 'https://www.geeksforgeeks.org/loops-in-java/'
    }
  ],
  'Python': [
    {
      question: 'Why is print() used?',
      answer: 'print() displays output.',
      code: 'print("Hello World")',
      link: 'https://www.geeksforgeeks.org/python-print-function/'
    },
    {
      question: 'Why is input() used?',
      answer: 'input() takes user input.',
      code: 'name = input("Enter Name: ")',
      link: 'https://www.geeksforgeeks.org/python-input-function/'
    },
    {
      question: 'What is a list?',
      answer: 'A list stores multiple ordered values.',
      code: 'numbers = [1, 2, 3, 4]',
      link: 'https://www.geeksforgeeks.org/python-lists/'
    },
    {
      question: 'What is tuple?',
      answer: 'Tuple is an immutable collection.',
      code: 'data = (1, 2, 3)',
      link: 'https://www.geeksforgeeks.org/python-tuples/'
    },
    {
      question: 'What is dictionary?',
      answer: 'Dictionary stores key-value pairs.',
      code: 'student = {"name":"Annu","age":22}',
      link: 'https://www.geeksforgeeks.org/python-dictionary/'
    },
    {
      question: 'What is def keyword?',
      answer: 'def is used to define functions.',
      code: 'def greet():\n    print("Hello")',
      link: 'https://www.geeksforgeeks.org/python-functions/'
    },
    {
      question: 'What is indentation?',
      answer: 'Indentation defines code blocks.',
      code: 'if True:\n    print("Hello")',
      link: 'https://www.geeksforgeeks.org/indentation-in-python/'
    },
    {
      question: 'What is Python?',
      answer: 'Python is a high-level programming language.',
      code: 'print("Python")',
      link: 'https://www.geeksforgeeks.org/python-programming-language-tutorial/'
    },
    {
      question: 'What is a variable?',
      answer: 'A variable stores data values.',
      code: 'age = 22',
      link: 'https://www.geeksforgeeks.org/python-variables/'
    },
    {
      question: 'What is a string?',
      answer: 'A string is a sequence of characters.',
      code: 'name = "Annu"',
      link: 'https://www.geeksforgeeks.org/python-string/'
    },
    {
      question: 'What is an integer?',
      answer: 'An integer stores whole numbers.',
      code: 'num = 100',
      link: 'https://www.geeksforgeeks.org/python-data-types/'
    },
    {
      question: 'What is a float?',
      answer: 'A float stores decimal numbers.',
      code: 'price = 99.99',
      link: 'https://www.geeksforgeeks.org/python-data-types/'
    },
    {
      question: 'What is a for loop?',
      answer: 'A for loop iterates over a sequence.',
      code: 'for i in range(5):\n    print(i)',
      link: 'https://www.geeksforgeeks.org/python-for-loops/'
    },
    {
      question: 'What is a while loop?',
      answer: 'A while loop executes while a condition is true.',
      code: 'while x < 5:\n    x += 1',
      link: 'https://www.geeksforgeeks.org/python-while-loop/'
    },
    {
      question: 'What is an if statement?',
      answer: 'An if statement is used for decision making.',
      code: 'if age > 18:\n    print("Adult")',
      link: 'https://www.geeksforgeeks.org/python-if-else/'
    },
    {
      question: 'What is a function?',
      answer: 'A function is a reusable block of code.',
      code: 'def add(a,b):\n    return a+b',
      link: 'https://www.geeksforgeeks.org/python-functions/'
    },
    {
      question: 'What is a class?',
      answer: 'A class is a blueprint for objects.',
      code: 'class Student:\n    pass',
      link: 'https://www.geeksforgeeks.org/python-classes-and-objects/'
    },
    {
      question: 'What is an object?',
      answer: 'An object is an instance of a class.',
      code: 's1 = Student()',
      link: 'https://www.geeksforgeeks.org/python-classes-and-objects/'
    },
    {
      question: 'What is inheritance?',
      answer: 'Inheritance allows one class to inherit properties from another.',
      code: 'class Child(Parent):\n    pass',
      link: 'https://www.geeksforgeeks.org/inheritance-in-python/'
    },
    {
      question: 'What is exception handling?',
      answer: 'Exception handling manages runtime errors.',
      code: 'try:\n    x=1\nexcept:\n    print("Error")',
      link: 'https://www.geeksforgeeks.org/python-exception-handling/'
    }
  ],
};

const languagesList = [
  { id: 'C', name: 'C Language', icon: require('../assets/images/c.png'), color: '#2563EB' },
  { id: 'C++', name: 'C++ OOPs', icon: require('../assets/images/cpp.png'), color: '#00599C' },
  { id: 'Java', name: 'Java OOPs', icon: require('../assets/images/java.png'), color: '#E76F51' },
  { id: 'Python', name: 'Python Scripting', icon: require('../assets/images/python.png'), color: '#3776AB' },
];
const getCardTag = (question: string) => {
  const q = question.toLowerCase();
  if (q.includes('modulus') || q.includes('operator') || q.includes('%')) {
    return 'OPERATORS';
  }
  if (q.includes('print') || q.includes('scan') || q.includes('cout') || q.includes('cin') || q.includes('input') || q.includes('stream')) {
    return 'INPUT/OUTPUT';
  }
  if (q.includes('class') || q.includes('object') || q.includes('inherit') || q.includes('poly') || q.includes('encap') || q.includes('construct') || q.includes('destruct') || q.includes('friend') || q.includes('abstract') || q.includes('interface')) {
    return 'OOP CONCEPTS';
  }
  if (q.includes('loop') || q.includes('for') || q.includes('while') || q.includes('if') || q.includes('switch') || q.includes('break') || q.includes('continue') || q.includes('decision')) {
    return 'CONTROL FLOW';
  }
  if (q.includes('array') || q.includes('vector') || q.includes('struct') || q.includes('pointer') || q.includes('string') || q.includes('stack') || q.includes('queue') || q.includes('map') || q.includes('int ') || q.includes('float') || q.includes('char') || q.includes('type') || q.includes('sizeof')) {
    return 'DATA STRUCTURES';
  }
  return 'CORE CONCEPT';
};

const cardThemes = [
  {
    themeColor: '#4F46E5', // Purple
    lightBg: '#EEF2F6', // Off white/slate
    textDark: '#4F46E5',
    badgeBg: '#EEF2F6',
    badgeText: '#4F46E5',
    icon: 'cube-outline',
    leftBorder: '#4F46E5',
    btnBg: '#4F46E5',
    defaultSteps: 4,
  },
  {
    themeColor: '#2563EB', // Blue
    lightBg: '#EFF6FF',
    textDark: '#1E40AF',
    badgeBg: '#DBEAFE',
    badgeText: '#2563EB',
    icon: 'book-outline',
    leftBorder: '#2563EB',
    btnBg: '#2563EB',
    defaultSteps: 3,
  },
  {
    themeColor: '#16A34A', // Green
    lightBg: '#ECFDF5',
    textDark: '#166534',
    badgeBg: '#D1FAE5',
    badgeText: '#16A34A',
    icon: 'folder-outline',
    leftBorder: '#16A34A',
    btnBg: '#16A34A',
    defaultSteps: 2,
  },
  {
    themeColor: '#EA580C', // Orange
    lightBg: '#FFF7ED',
    textDark: '#9A3412',
    badgeBg: '#FFEDD5',
    badgeText: '#EA580C',
    icon: 'albums-outline',
    leftBorder: '#EA580C',
    btnBg: '#EA580C',
    defaultSteps: 3,
  },
  {
    themeColor: '#EF4444', // Red
    lightBg: '#FEF2F2',
    textDark: '#991B1B',
    badgeBg: '#FEE2E2',
    badgeText: '#EF4444',
    icon: 'navigate-outline',
    leftBorder: '#EF4444',
    btnBg: '#EF4444',
    defaultSteps: 4,
  },
  {
    themeColor: '#8B5CF6', // Violet
    lightBg: '#F5F3FF',
    textDark: '#5B21B6',
    badgeBg: '#EDE9FE',
    badgeText: '#8B5CF6',
    icon: 'calculator-outline',
    leftBorder: '#8B5CF6',
    btnBg: '#8B5CF6',
    defaultSteps: 3,
  },
];

const BannerIllustration = () => {
  return (
    <Svg width="190" height="120" viewBox="0 0 190 120" style={{ alignSelf: 'flex-end', marginRight: 10 }}>
      {/* Laptop Screen */}
      <Rect x="40" y="25" width="84" height="56" rx="5" fill="#0f172a" stroke="#475569" strokeWidth="2.5" />
      {/* Code placeholder on screen */}
      <SvgText x="50" y="46" fill="#38bdf8" fontSize="10" fontWeight="bold" fontFamily="monospace">&lt;/&gt;</SvgText>
      <Rect x="50" y="56" width="35" height="4" rx="1.5" fill="#475569" />
      <Rect x="50" y="64" width="45" height="4" rx="1.5" fill="#38bdf8" />
      <Rect x="50" y="72" width="25" height="4" rx="1.5" fill="#f43f5e" />

      {/* Laptop Base */}
      <Path d="M30 81 H134 L139 90 H25 Z" fill="#64748b" />
      <Rect x="74" y="84" width="16" height="3" rx="1.5" fill="#334155" />

      {/* Small Mug */}
      <Path d="M148 68 H164 V88 A6 6 0 0 1 158 94 H154 A6 6 0 0 1 148 88 Z" fill="#ffffff" />
      <Path d="M164 74 H169 A3 3 0 0 1 172 77 V81 A3 3 0 0 1 169 84 H164" fill="none" stroke="#ffffff" strokeWidth="2.5" />
      {/* Code printed on mug */}
      <SvgText x="151" y="83" fill="#6366f1" fontSize="7" fontWeight="bold" fontFamily="monospace">&lt;/&gt;</SvgText>

      {/* Plant Pot */}
      <Path d="M12 76 L16 94 H28 L32 76 Z" fill="#e2e8f0" />
      {/* Plant Leaves */}
      <Path d="M15 76 C8 65 15 52 15 52" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
      <Path d="M22 76 C22 55 26 44 26 44" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
      <Path d="M29 76 C37 63 32 54 32 54" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
    </Svg>
  );
};

function FlashCardItem({
  card,
  index,
  speakAnswer,
  language,
  isMastered,
  toggleMastered,
  isStarred,
  toggleStar,
  onStudied,
}: any) {
  const { isDark, colors } = useTheme();
  const { width } = useWindowDimensions();
  const flipAnim = React.useRef(new Animated.Value(0)).current;
  const [flipped, setFlipped] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);

  const isMobile = width < 992;
  const cardWidth = isMobile ? width - 32 : (width - 80) / 3;
  const theme = cardThemes[index % cardThemes.length];
  const tag = getCardTag(card.question);

  const flipCard = () => {
    if (!flipped) {
      onStudied(card.question);
    }
    Animated.spring(flipAnim, {
      toValue: flipped ? 0 : 180,
      useNativeDriver: true,
    }).start();

    setFlipped(!flipped);
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const steps = theme.defaultSteps;
  const currentStep = isMastered ? steps : 0;
  const progressPercent = `${(currentStep / steps) * 100}%` as any;

  return (
    <Pressable
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[
        styles.cardContainer,
        { width: cardWidth },
        hovered && styles.cardContainerHover,
      ]}
    >
      {/* FRONT */}
      <Animated.View
        pointerEvents={flipped ? 'none' : 'auto'}
        style={[
          styles.card,
          {
            transform: [{ rotateY: frontInterpolate }],
            zIndex: flipped ? 1 : 2,
            borderLeftColor: theme.leftBorder,
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
          },
        ]}
      >
        <View style={styles.cardPadding}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.cardHeaderIconContainer, { backgroundColor: theme.badgeBg }]}>
                <Ionicons name={theme.icon as any} size={15} color={theme.themeColor} />
              </View>
              <Text style={[styles.cardNumber, { color: isDark ? '#94a3b8' : '#475569' }]}>
                {String(index + 1).padStart(2, '0')}
              </Text>
              <View style={[styles.categoryBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.badgeBg }]}>
                <Text style={[styles.categoryBadgeText, { color: theme.themeColor }]}>
                  {tag}
                </Text>
              </View>
            </View>
            <View style={styles.cardHeaderRight}>
              <Text style={[styles.cardLangKey, { color: isDark ? '#94a3b8' : '#475569' }]}>
                {language}
              </Text>
              <TouchableOpacity onPress={() => toggleStar(card.question)} style={{ marginLeft: 8 }}>
                <Ionicons
                  name={isStarred ? "star" : "star-outline"}
                  size={16}
                  color={isStarred ? "#f59e0b" : (isDark ? "#94a3b8" : "#94a3b8")}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Question */}
          <Text style={[styles.questionText, { color: isDark ? '#ffffff' : '#0f172a' }]} numberOfLines={2}>
            {card.question}
          </Text>

          {/* Code block box */}
          {card.code ? (
            <View style={[styles.codeBox, { backgroundColor: isDark ? '#0f172a' : theme.lightBg }]}>
              <Text style={[styles.codeText, { color: isDark ? '#38bdf8' : theme.themeColor }]}>
                {card.code}
              </Text>
            </View>
          ) : (
            <View style={styles.codeBoxEmpty} />
          )}

          {/* Footer progress bar and button */}
          <View style={styles.cardFooter}>
            <View style={styles.progressCol}>
              <Text style={[styles.progressText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                {currentStep}/{steps} Learned
              </Text>
              <View style={[styles.cardProgressBarTrack, { backgroundColor: isDark ? '#0f172a' : '#e2e8f0' }]}>
                <View style={[styles.cardProgressBarFill, { width: progressPercent, backgroundColor: theme.themeColor }]} />
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.studyBtn, { backgroundColor: theme.themeColor }]}
              onPress={flipCard}
            >
              <Text style={styles.studyBtnText}>Study Now</Text>
              <Ionicons name="arrow-forward" size={13} color="#ffffff" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* BACK */}
      <Animated.View
        pointerEvents={flipped ? 'auto' : 'none'}
        style={[
          styles.card,
          styles.cardBack,
          {
            transform: [{ rotateY: backInterpolate }],
            zIndex: flipped ? 2 : 1,
            borderLeftColor: theme.leftBorder,
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
          },
        ]}
      >
        <View style={styles.cardPadding}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={[styles.backTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Answer</Text>
              {isMastered && (
                <View style={styles.learnedBadge}>
                  <Text style={styles.learnedBadgeText}>🏆 Learned</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => toggleMastered(card.question)}
              style={[styles.markLearnedBtn, isMastered && styles.markLearnedBtnActive]}
            >
              <Text style={[styles.markLearnedBtnText, isMastered && styles.markLearnedBtnTextActive]}>
                {isMastered ? '🏆 Learned' : '✅ Mark Learned'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Answer text */}
          <ScrollView style={styles.backAnswerScroll}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}  
          showsVerticalScrollIndicator={false}>
            <Text style={[styles.backAnswerText, { color: isDark ? '#cbd5e1' : '#334155' }]}>
              {card.answer}
            </Text>
          </ScrollView>

          {/* Action Row */}
          <View style={styles.backActionsRow}>
            <TouchableOpacity onPress={() => speakAnswer(card.answer)} style={styles.audioBtn}>
              <Ionicons name="volume-medium-outline" size={16} color="#ffffff" />
              <Text style={styles.audioBtnText}>Listen</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Linking.openURL(card.link)}
              style={[styles.outlinedActionBtn, { borderColor: theme.themeColor }]}
            >
              <Text style={[styles.outlinedActionBtnText, { color: theme.themeColor }]}>📖 Learn</Text>
            </TouchableOpacity>

            {card.code ? (
              <TouchableOpacity
                onPress={() => {
                  let langParam = language.toLowerCase();
                  if (langParam === 'c++') langParam = 'cpp';
                  router.push({
                    pathname: '/playground',
                    params: { code: card.code, language: langParam }
                  });
                }}
                style={[styles.outlinedActionBtn, { borderColor: '#10b981' }]}
              >
                <Text style={[styles.outlinedActionBtnText, { color: '#10b981' }]}>💻 Playground</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Flip back footer */}
          <TouchableOpacity onPress={flipCard} style={styles.flipBackFooter}>
            <Text style={[styles.flipBackFooterText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              ← Flip Back to Card
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default function Flashcards() {
  const { isDark, colors, toggleTheme } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 992;

  const { language } = useLocalSearchParams();
  const [selectedLanguage, setSelectedLanguage] = useState<keyof typeof flashcardData>(
    (language as keyof typeof flashcardData) || 'C'
  );

  const [cards, setCards] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All Topics');
  const [topicDropdownVisible, setTopicDropdownVisible] = useState(false);

  const [masteredQuestions, setMasteredQuestions] = useState<string[]>([]);
  const [starredQuestions, setStarredQuestions] = useState<string[]>([]);
  const [studiedQuestions, setStudiedQuestions] = useState<string[]>([]);

  const [seconds, setSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);
  const [streakCount, setStreakCount] = useState(0);
  const [profileName, setProfileName] = useState('Annu');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-290)).current;

  useEffect(() => {
    // Reset session states on language change
    setSeconds(0);
    setStudiedQuestions([]);
    setSearchQuery('');
    setSelectedTopic('All Topics');

    const loadCacheData = async () => {
      try {
        const storedMastered = await AsyncStorage.getItem(`@learn2code_mastered_${selectedLanguage}`);
        if (storedMastered) setMasteredQuestions(JSON.parse(storedMastered));
        else setMasteredQuestions([]);

        const storedStarred = await AsyncStorage.getItem(`@learn2code_starred_${selectedLanguage}`);
        if (storedStarred) setStarredQuestions(JSON.parse(storedStarred));
        else setStarredQuestions([]);

        const storedStudied = await AsyncStorage.getItem(`@learn2code_studied_${selectedLanguage}`);
        if (storedStudied) setStudiedQuestions(JSON.parse(storedStudied));

        const savedPhoto = await AsyncStorage.getItem('@profile_photo');
        if (savedPhoto) setProfilePic(savedPhoto);

        const localStreak = await AsyncStorage.getItem('current_streak');
        if (localStreak) setStreakCount(parseInt(localStreak));

        // Load user name
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const profileRes = await fetch(`${API_URL}/api/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            if (profileData && profileData.name) {
              setProfileName(profileData.name);
            }
          }
        }
      } catch (err) {
        console.log('Error reading local storage in flashcards:', err);
      }

      // Load items
      const fallback = (flashcardData as any)[selectedLanguage] || [];
      let cached = null;
      try {
        cached = await AsyncStorage.getItem(`flashcards_${selectedLanguage}`);
      } catch (err) {
        console.log('Error reading cache:', err);
      }

      if (cached) {
        try {
          setCards(JSON.parse(cached));
        } catch (e) {
          setCards(fallback);
        }
      } else {
        setCards(fallback);
      }

      // Fetch fresh items from backend
      try {
        const response = await fetch(`${API_URL}/api/flashcards?language=${encodeURIComponent(selectedLanguage)}`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setCards(data);
            await AsyncStorage.setItem(`flashcards_${selectedLanguage}`, JSON.stringify(data));
          }
        }
      } catch (err) {
        console.log('Failed to fetch flashcards from server:', err);
      }
    };

    loadCacheData();
  }, [selectedLanguage]);

  useEffect(() => {
    let interval: any;
    if (timerRunning) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const shuffleCards = () => {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setCards(shuffled);
  };

  const toggleMastered = async (question: string) => {
    let nextList: string[];
    if (masteredQuestions.includes(question)) {
      nextList = masteredQuestions.filter((q) => q !== question);
    } else {
      nextList = [...masteredQuestions, question];
    }
    setMasteredQuestions(nextList);
    try {
      await AsyncStorage.setItem(`@learn2code_mastered_${selectedLanguage}`, JSON.stringify(nextList));
    } catch (err) {
      console.log('Error writing mastered questions:', err);
    }
  };

  const toggleStar = async (question: string) => {
    let nextList: string[];
    if (starredQuestions.includes(question)) {
      nextList = starredQuestions.filter((q) => q !== question);
    } else {
      nextList = [...starredQuestions, question];
    }
    setStarredQuestions(nextList);
    try {
      await AsyncStorage.setItem(`@learn2code_starred_${selectedLanguage}`, JSON.stringify(nextList));
    } catch (err) {
      console.log('Error writing starred questions:', err);
    }
  };

  const handleStudied = async (question: string) => {
    if (!studiedQuestions.includes(question)) {
      const nextList = [...studiedQuestions, question];
      setStudiedQuestions(nextList);
      try {
        await AsyncStorage.setItem(`@learn2code_studied_${selectedLanguage}`, JSON.stringify(nextList));
      } catch (err) {
        console.log('Error saving studied questions:', err);
      }
    }
  };

  const speakAnswer = (answer: string) => {
    Speech.speak(answer, {
      language: 'en',
      rate: 0.9,
    });
  };

  const toggleDrawer = (open: boolean) => {
    if (open) {
      setDrawerVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -290,
        duration: 220,
        useNativeDriver: true,
      }).start(() => setDrawerVisible(false));
    }
  };

  const filteredCards = cards.filter((card: any) => {
    const matchesSearch = card.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (card.code && card.code.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const tag = getCardTag(card.question);
    const matchesTopic = selectedTopic === 'All Topics' || tag === selectedTopic;

    return matchesSearch && matchesTopic;
  });

  const topicsList = ['All Topics', 'INPUT/OUTPUT', 'DATA STRUCTURES', 'OPERATORS', 'CONTROL FLOW', 'OOP CONCEPTS', 'CORE CONCEPT'];

  // Calculations for stats
  const accuracy = studiedQuestions.length > 0
    ? Math.round((masteredQuestions.filter((q) => studiedQuestions.includes(q)).length / studiedQuestions.length) * 100)
    : 0;

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#0b0f19' : '#f8fafc' }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER COMPONENT */}
      <View style={[styles.header, { 
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'
      }]}>
        <View style={styles.headerLeft}>
          {isMobile ? (
            <TouchableOpacity style={{ padding: 4, marginRight: 8 }} onPress={() => toggleDrawer(true)}>
              <Ionicons name="menu-outline" size={24} color={isDark ? '#ffffff' : '#0f172a'} />
            </TouchableOpacity>
          ) : null}

          {/* Logo container */}
          <View style={styles.logoSquare}>
            <Ionicons name="code-slash" size={16} color="#ffffff" />
          </View>
          <Text style={[styles.logoText, { color: isDark ? '#ffffff' : '#0f172a' }]}>Learn2Code</Text>

          {/* Nav links on desktop */}
          {!isMobile ? (
            <View style={styles.navLinksRow}>
              <TouchableOpacity onPress={() => router.push('/home')}>
                <Text style={[styles.navLinkText, { color: isDark ? '#94a3b8' : '#64748b' }]}>Dashboard</Text>
              </TouchableOpacity>
              <View style={styles.activeNavLinkWrapper}>
                <Text style={[styles.navLinkText, styles.activeNavLinkText]}>Flashcards</Text>
                <View style={styles.activeNavLinkIndicator} />
              </View>
              <TouchableOpacity onPress={() => router.push('/mcq')}>
                <Text style={[styles.navLinkText, { color: isDark ? '#94a3b8' : '#64748b' }]}>Quizzes</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/learn')}>
                <Text style={[styles.navLinkText, { color: isDark ? '#94a3b8' : '#64748b' }]}>My Learning</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/leaderboard')}>
                <Text style={[styles.navLinkText, { color: isDark ? '#94a3b8' : '#64748b' }]}>Achievements</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        <View style={styles.headerRight}>
          {/* Notification bell */}
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={20} color={isDark ? '#cbd5e1' : '#475569'} />
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>3</Text>
            </View>
          </TouchableOpacity>

          {/* Toggle Theme */}
          <TouchableOpacity style={[styles.iconBtn, { marginRight: 12 }]} onPress={toggleTheme}>
            <Ionicons name={isDark ? "sunny" : "moon-outline"} size={20} color={isDark ? "#f59e0b" : "#475569"} />
          </TouchableOpacity>

          {/* Profile Dropdown */}
          <TouchableOpacity style={styles.profileBox} onPress={() => router.push('/account')}>
            <Image
              source={profilePic ? { uri: profilePic } : require('../assets/images/avatar.png')}
              style={styles.profileAvatar}
            />
            <Text style={[styles.profileName, { color: isDark ? '#f8fafc' : '#1e293b' }]}>
              {profileName}
            </Text>
            <Ionicons name="chevron-down" size={14} color={isDark ? '#94a3b8' : '#64748b'} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* BANNER SECTION */}
        <LinearGradient
          colors={isDark ? ['#1e293b', '#0f172a'] : ['#4f46e5', '#3b82f6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.banner, isMobile && styles.bannerMobile]}
        >
          {!isMobile && (
            <Image
              source={require('../assets/images/account.png')}
              style={[
                styles.bannerBgImage,
                isDark && { opacity: 0.25 }
              ]}
            />
          )}
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerTitle}>{selectedLanguage} Flashcards</Text>
            <Text style={styles.bannerSub}>
              Study and master code blocks! Shuffle, search, track your time, and mark cards as learned.
            </Text>
          </View>
        </LinearGradient>

        {/* LANGUAGE SELECTION CARD BAR */}
        <View style={styles.langSelectContainer}>
          {languagesList.map((lang) => {
            const isSelected = selectedLanguage === lang.id;
            const cardCount = (flashcardData as any)[lang.id]?.length || 0;
            return (
              <TouchableOpacity
                key={lang.id}
                activeOpacity={0.85}
                onPress={() => setSelectedLanguage(lang.id as any)}
                style={[
                  styles.langSelectCard,
                  {
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isSelected 
                      ? lang.color 
                      : (isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'),
                    borderWidth: isSelected ? 2 : 1,
                  },
                  isSelected && styles.langSelectCardActive,
                ]}
              >
                <Image source={lang.icon} style={styles.langSelectIcon} />
                <View style={styles.langSelectTextCol}>
                  <Text style={[styles.langSelectName, { color: isDark ? '#ffffff' : '#0f172a' }]}>
                    {lang.name}
                  </Text>
                  <Text style={[styles.langSelectSub, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                    {cardCount} Cards
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* CONTROLS BAR (SEARCH + FILTER + SHUFFLE) */}
        <View style={styles.controlsBar}>
          <View style={[styles.searchContainer, { 
            backgroundColor: isDark ? '#0f172a' : '#ffffff',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'
          }]}>
            <Ionicons name="search-outline" size={18} color="#94a3b8" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Search flashcards by topic or keyword..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={[styles.searchInput, { color: isDark ? '#ffffff' : '#0f172a' }]}
            />
          </View>

          {/* Topic Dropdown Filter */}
          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.dropdownBtn, { 
                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'
              }]}
              onPress={() => setTopicDropdownVisible(!topicDropdownVisible)}
            >
              <Ionicons name="list-outline" size={18} color={isDark ? '#cbd5e1' : '#475569'} style={{ marginRight: 6 }} />
              <Text style={[styles.dropdownBtnText, { color: isDark ? '#cbd5e1' : '#1e293b' }]}>
                {selectedTopic}
              </Text>
              <Ionicons name="chevron-down" size={14} color="#94a3b8" style={{ marginLeft: 8 }} />
            </TouchableOpacity>

            {/* Dropdown Items overlay */}
            {topicDropdownVisible && (
              <View style={[styles.dropdownItemsList, { 
                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                shadowColor: isDark ? '#000000' : '#0f172a',
              }]}>
                {topicsList.map((topic) => (
                  <TouchableOpacity
                    key={topic}
                    style={[styles.dropdownItem, selectedTopic === topic && (isDark ? styles.dropdownItemActiveDark : styles.dropdownItemActiveLight)]}
                    onPress={() => {
                      setSelectedTopic(topic);
                      setTopicDropdownVisible(false);
                    }}
                  >
                    <Text style={[
                      styles.dropdownItemText, 
                      { color: isDark ? '#cbd5e1' : '#334155' },
                      selectedTopic === topic && { color: '#6366f1', fontWeight: '700' }
                    ]}>
                      {topic}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Shuffle button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={shuffleCards}
            style={styles.shuffleButton}
          >
            <Ionicons name="shuffle" size={18} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.shuffleButtonText}>Shuffle</Text>
          </TouchableOpacity>
        </View>

        {/* CARDS GRID */}
        {filteredCards.length > 0 ? (
          <View style={styles.cardsGrid}>
            {filteredCards.map((card: any, idx: number) => (
              <FlashCardItem
                key={card.question}
                card={card}
                index={idx}
                speakAnswer={speakAnswer}
                language={selectedLanguage}
                isMastered={masteredQuestions.includes(card.question)}
                toggleMastered={toggleMastered}
                isStarred={starredQuestions.includes(card.question)}
                toggleStar={toggleStar}
                onStudied={handleStudied}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="copy-outline" size={48} color="#94a3b8" />
            <Text style={[styles.emptyText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              No flashcards match your filters.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* MOBILE DRAWER MODAL */}
      <Modal
        visible={drawerVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => toggleDrawer(false)}
      >
        <View style={styles.drawerOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => toggleDrawer(false)} />
          <Animated.View style={[
            styles.drawerBody,
            { transform: [{ translateX: slideAnim }], backgroundColor: isDark ? '#0f172a' : '#ffffff' }
          ]}>
            <View style={[styles.drawerHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9' }]}>
              <View style={styles.drawerAvatarContainer}>
                <Image
                  source={profilePic ? { uri: profilePic } : require('../assets/images/avatar.png')}
                  style={styles.drawerAvatar}
                />
              </View>
              <View style={styles.drawerUserInfo}>
                <Text style={[styles.drawerUserName, { color: isDark ? '#f8fafc' : '#1e293b' }]} numberOfLines={1}>
                  {profileName}
                </Text>
                <Text style={styles.drawerUserEmail} numberOfLines={1}>
                  Annu@learn2code.com
                </Text>
              </View>
            </View>

            <ScrollView style={styles.drawerNavScroll}>
              {[
                { name: 'Home', icon: 'home-outline', route: '/home' },
                { name: 'Learn', icon: 'book-outline', route: '/learn' },
                { name: 'Flashcards', icon: 'copy-outline', route: '/flashcards', isActive: true },
                { name: 'Quiz', icon: 'help-circle-outline', route: '/mcq' },
                { name: 'Notes', icon: 'document-text-outline', route: '/notes' },
                { name: 'Revision', icon: 'repeat-outline', route: '/revision' },
                { name: 'Playground', icon: 'code-slash-outline', route: '/playground' },
                { name: 'Leaderboard', icon: 'trophy-outline', route: '/leaderboard' },
                { name: 'Account', icon: 'person-outline', route: '/account' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.name}
                  style={[styles.drawerNavItem, item.isActive && styles.drawerNavItemActive]}
                  onPress={() => {
                    toggleDrawer(false);
                    if (!item.isActive) router.push(item.route as any);
                  }}
                >
                  <Ionicons name={item.icon as any} size={20} color={item.isActive ? '#6366f1' : '#64748b'} style={{ marginRight: 12 }} />
                  <Text style={[styles.drawerNavItemText, { color: item.isActive ? '#6366f1' : (isDark ? '#cbd5e1' : '#334155') }]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    zIndex: 99,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoSquare: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    marginRight: 36,
  },
  navLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  navLinkText: {
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 6,
  },
  activeNavLinkWrapper: {
    position: 'relative',
    paddingVertical: 6,
  },
  activeNavLinkText: {
    color: '#6366f1',
    fontWeight: '700',
  },
  activeNavLinkIndicator: {
    position: 'absolute',
    bottom: -8,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#6366f1',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginRight: 6,
  },
  bellBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  bellBadgeText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '900',
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: '#6366f1',
  },
  profileName: {
    fontSize: 14,
    fontWeight: '700',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  banner: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    overflow: 'hidden',
    aspectRatio: 1942 / 380,
    minHeight: 140,
    maxHeight: 240,
    backgroundColor: '#4f46e5',
  },
  bannerBgImage: {
    position: 'absolute',
    right: -360,
    top: 0,
    bottom:0,
    height: '100%',
    aspectRatio: 1942 / 380,
    resizeMode: 'contain',
  },
  bannerMobile: {
    aspectRatio: undefined,
    height: 130,
    padding: 16,
  },
  langSelectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
    width: '100%',
  },
  langSelectCard: {
    flex: 1,
    minWidth: 160,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  langSelectCardActive: {
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    transform: [{ scale: 1.02 }],
  },
  langSelectIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginRight: 12,
    resizeMode: 'contain',
  },
  langSelectTextCol: {
    justifyContent: 'center',
  },
  langSelectName: {
    fontSize: 15,
    fontWeight: '800',
  },
  langSelectSub: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  bannerLeft: {
    flex: 1,
    marginRight: 20,
  },
  bannerTitle: {
    color: '#f8f3f3',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 8,
  },
  bannerSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 550,
  },
  dashboardCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    height:180,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statCol: {
    flex: 1,
    minWidth: 150,
    marginVertical: 10,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerValue: {
    fontSize: 22,
    fontWeight: '900',
    marginRight: 10,
  },
  pauseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pauseBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statHeadingTextCol: {
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 12,
  },
  masteryProgressContainer: {
    borderTopWidth: 1,
    marginTop: 16,
    paddingTop: 16,
  },
  masteryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  masteryEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  masteryLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  masteryStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFillMain: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 3,
  },
  controlsBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
    zIndex: 10,
  },
  searchContainer: {
    flex: 1,
    minWidth: 260,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
    ...({ outlineStyle: 'none', outline: 'none', border: 'none' } as any),
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 9999,
  },
  dropdownBtn: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    minWidth: 150,
  },
  dropdownBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dropdownItemsList: {
    position: 'absolute',
    top: 48,
    left: 0,
    width: 200,
    borderRadius: 12,
    borderWidth: 1,
    padding: 6,
    elevation: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    zIndex: 100000,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  dropdownItemActiveLight: {
    backgroundColor: '#f1f5f9',
  },
  dropdownItemActiveDark: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  dropdownItemText: {
    fontSize: 13,
    fontWeight: '500',
  },
  shuffleButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shuffleButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'flex-start',
  },
  cardContainer: {
    height: 230,
    marginBottom: 10,
    position: 'relative',
  },
  cardContainerHover: {
    transform: [{ scale: 1.015 }],
  },
  card: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 1,
    borderLeftWidth: 6,
    elevation: 3,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    backfaceVisibility: 'hidden',
  },
  cardPadding: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 24,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  cardNumber: {
    fontSize: 12,
    fontWeight: '700',
    marginRight: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLangKey: {
    fontSize: 13,
    fontWeight: '800',
  },
  questionText: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 6,
  },
  codeBox: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    justifyContent: 'center',
    minHeight: 48,
    marginVertical: 6,
  },
  codeBoxEmpty: {
    minHeight: 48,
    marginVertical: 6,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressCol: {
    flex: 1,
    marginRight: 16,
  },
  progressText: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardProgressBarTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  cardProgressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  studyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 8,
  },
  studyBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  backTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginRight: 8,
  },
  learnedBadge: {
    backgroundColor: '#fffbeb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  learnedBadgeText: {
    color: '#d97706',
    fontSize: 9,
    fontWeight: '800',
  },
  markLearnedBtn: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  markLearnedBtnActive: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  markLearnedBtnText: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '700',
  },
  markLearnedBtnTextActive: {
    color: '#ffffff',
  },
  backAnswerScroll: {
    flex: 1,
    marginVertical: 10,
  },
  backAnswerText: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '500',
    
    
  },
  backActionsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  audioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 6,
  },
  audioBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 3,
  },
  outlinedActionBtn: {
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  outlinedActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  flipBackFooter: {
    alignSelf: 'center',
    marginTop: 10,
    paddingVertical: 2,
  },
  flipBackFooterText: {
    fontSize: 11,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    flexDirection: 'row',
  },
  drawerBody: {
    width: 280,
    height: '100%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  drawerHeader: {
    padding: 24,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawerAvatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  drawerAvatar: {
    width: '100%',
    height: '100%',
  },
  drawerUserInfo: {
    flex: 1,
  },
  drawerUserName: {
    fontSize: 16,
    fontWeight: '700',
  },
  drawerUserEmail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  drawerNavScroll: {
    flex: 1,
    padding: 12,
  },
  drawerNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 4,
  },
  drawerNavItemActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  drawerNavItemText: {
    fontSize: 14,
    fontWeight: '600',
  },
});