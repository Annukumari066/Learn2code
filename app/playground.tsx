import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../config';

const TEMPLATES = {
  python: `# Learn2Code Python Playground
print("Hello, World!")

# Try variables and loops:
total = 0
for i in range(1, 11):
    total += i
print(f"Sum of 1 to 10 is: {total}")
`,
  c: `/* Learn2Code C Playground */
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    
    // Try variables and loops:
    int sum = 0;
    for (int i = 1; i <= 10; i++) {
        sum += i;
    }
    printf("Sum of 1 to 10 is: %d\\n", sum);
    
    return 0;
}
`,
  cpp: `/* Learn2Code C++ Playground */
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    
    // Try variables and loops:
    int sum = 0;
    for (int i = 1; i <= 10; i++) {
        sum += i;
    }
    cout << "Sum of 1 to 10 is: " << sum << endl;
    
    return 0;
}
`,
  java: `// Learn2Code Java Playground
// Note: Keep class name as Main
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Try variables and loops:
        int sum = 0;
        for (int i = 1; i <= 10; i++) {
            sum += i;
        }
        System.out.println("Sum of 1 to 10 is: " + sum);
    }
}
`
};

const PRACTICE_QUESTIONS = {
  python: [
    {
      id: 'py_1',
      title: 'Hello World',
      description: 'Print "Hello, World!" to the console.',
      code: `# Print Hello World
print("Hello, World!")`,
      output: 'Hello, World!'
    },
    {
      id: 'py_2',
      title: 'Add Two Numbers',
      description: 'Calculate and print the sum of two integers (5 and 10).',
      code: `# Add Two Numbers
num1 = 5
num2 = 10
sum_val = num1 + num2
print("Sum is:", sum_val)`,
      output: 'Sum is: 15'
    },
    {
      id: 'py_3',
      title: 'Even or Odd',
      description: 'Check if a given number (8) is even or odd.',
      code: `# Even or Odd
num = 8
if num % 2 == 0:
    print("Even Number")
else:
    print("Odd Number")`,
      output: 'Even Number'
    },
    {
      id: 'py_4',
      title: 'Factorial of a Number',
      description: 'Find the factorial of a number (5).',
      code: `# Factorial of 5
num = 5
factorial = 1
for i in range(1, num + 1):
    factorial *= i
print("Factorial is:", factorial)`,
      output: 'Factorial is: 120'
    },
    {
      id: 'py_5',
      title: 'Fibonacci Series',
      description: 'Print the first 5 terms of the Fibonacci series.',
      code: `# Fibonacci Series (5 terms)
n = 5
a, b = 0, 1
for _ in range(n):
    print(a, end=" ")
    a, b = b, a + b
print()`,
      output: '0 1 1 2 3'
    },
    {
      id: 'py_6',
      title: 'Prime Number Check',
      description: 'Check if a number (11) is prime.',
      code: `# Prime Check
num = 11
is_prime = True
for i in range(2, int(num ** 0.5) + 1):
    if num % i == 0:
        is_prime = False
        break
if is_prime:
    print("Prime Number")
else:
    print("Not a Prime Number")`,
      output: 'Prime Number'
    },
    {
      id: 'py_7',
      title: 'Reverse a String',
      description: 'Reverse a string "Python" and print it.',
      code: `# Reverse String
txt = "Python"
reversed_txt = txt[::-1]
print("Reversed:", reversed_txt)`,
      output: 'Reversed: nohtyP'
    },
    {
      id: 'py_8',
      title: 'Largest in List',
      description: 'Find the maximum value in a list [4, 12, 7, 19, 3].',
      code: `# Find Largest
numbers = [4, 12, 7, 19, 3]
max_val = numbers[0]
for num in numbers:
    if num > max_val:
        max_val = num
print("Largest is:", max_val)`,
      output: 'Largest is: 19'
    },
    {
      id: 'py_9',
      title: 'Count Vowels',
      description: 'Count the number of vowels in the string "education".',
      code: `# Count Vowels
txt = "education"
vowels = "aeiou"
count = sum(1 for char in txt if char in vowels)
print("Vowels count:", count)`,
      output: 'Vowels count: 5'
    },
    {
      id: 'py_10',
      title: 'Check Palindrome',
      description: 'Check if string "radar" is a palindrome.',
      code: `# Palindrome Check
word = "radar"
if word == word[::-1]:
    print("Palindrome")
else:
    print("Not Palindrome")`,
      output: 'Palindrome'
    }
  ],
  c: [
    {
      id: 'c_1',
      title: 'Hello World',
      description: 'Print "Hello, World!" in C.',
      code: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
      output: 'Hello, World!'
    },
    {
      id: 'c_2',
      title: 'Add Two Numbers',
      description: 'Calculate sum of 10 and 20.',
      code: `#include <stdio.h>

int main() {
    int a = 10, b = 20;
    int sum = a + b;
    printf("Sum: %d\\n", sum);
    return 0;
}`,
      output: 'Sum: 30'
    },
    {
      id: 'c_3',
      title: 'Even or Odd',
      description: 'Check if number 15 is even or odd.',
      code: `#include <stdio.h>

int main() {
    int num = 15;
    if (num % 2 == 0) {
        printf("Even\\n");
    } else {
        printf("Odd\\n");
    }
    return 0;
}`,
      output: 'Odd'
    },
    {
      id: 'c_4',
      title: 'Factorial using Loop',
      description: 'Calculate factorial of 5.',
      code: `#include <stdio.h>

int main() {
    int num = 5;
    long long factorial = 1;
    for (int i = 1; i <= num; i++) {
        factorial *= i;
    }
    printf("Factorial: %lld\\n", factorial);
    return 0;
}`,
      output: 'Factorial: 120'
    },
    {
      id: 'c_5',
      title: 'Fibonacci Series',
      description: 'Print first 5 Fibonacci numbers.',
      code: `#include <stdio.h>

int main() {
    int n = 5;
    int t1 = 0, t2 = 1, nextTerm;
    for (int i = 1; i <= n; ++i) {
        printf("%d ", t1);
        nextTerm = t1 + t2;
        t1 = t2;
        t2 = nextTerm;
    }
    printf("\\n");
    return 0;
}`,
      output: '0 1 1 2 3'
    },
    {
      id: 'c_6',
      title: 'Prime Number Check',
      description: 'Check if number 7 is prime.',
      code: `#include <stdio.h>

int main() {
    int num = 7, isPrime = 1;
    for (int i = 2; i <= num / 2; i++) {
        if (num % i == 0) {
            isPrime = 0;
            break;
        }
    }
    if (isPrime && num > 1) {
        printf("Prime\\n");
    } else {
        printf("Not Prime\\n");
    }
    return 0;
}`,
      output: 'Prime'
    },
    {
      id: 'c_7',
      title: 'Reverse a Number',
      description: 'Reverse the digits of 1234.',
      code: `#include <stdio.h>

int main() {
    int num = 1234, reversed = 0, remainder;
    while (num != 0) {
        remainder = num % 10;
        reversed = reversed * 10 + remainder;
        num /= 10;
    }
    printf("Reversed: %d\\n", reversed);
    return 0;
}`,
      output: 'Reversed: 4321'
    },
    {
      id: 'c_8',
      title: 'Largest in Array',
      description: 'Find max value in array {10, 50, 20, 8, 30}.',
      code: `#include <stdio.h>

int main() {
    int arr[] = {10, 50, 20, 8, 30};
    int n = 5;
    int max = arr[0];
    for (int i = 1; i < n; i++) {
        if (arr[i] > max) {
            max = arr[i];
        }
    }
    printf("Max: %d\\n", max);
    return 0;
}`,
      output: 'Max: 50'
    },
    {
      id: 'c_9',
      title: 'Average of Array',
      description: 'Calculate average of array {2, 4, 6, 8, 10}.',
      code: `#include <stdio.h>

int main() {
    int arr[] = {2, 4, 6, 8, 10};
    int sum = 0;
    for (int i = 0; i < 5; i++) {
        sum += arr[i];
    }
    double avg = (double)sum / 5;
    printf("Average: %.1f\\n", avg);
    return 0;
}`,
      output: 'Average: 6.0'
    },
    {
      id: 'c_10',
      title: 'Swap Two Numbers',
      description: 'Swap two numbers (5, 10) without using a temp variable.',
      code: `#include <stdio.h>

int main() {
    int x = 5, y = 10;
    x = x + y;
    y = x - y;
    x = x - y;
    printf("Swapped: x=%d, y=%d\\n", x, y);
    return 0;
}`,
      output: 'Swapped: x=10, y=5'
    }
  ],
  cpp: [
    {
      id: 'cpp_1',
      title: 'Hello World',
      description: 'Print "Hello, World!" using cout.',
      code: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
      output: 'Hello, World!'
    },
    {
      id: 'cpp_2',
      title: 'Add Two Numbers',
      description: 'Add two numbers input variables.',
      code: `#include <iostream>
using namespace std;

int main() {
    int a = 12, b = 18;
    cout << "Sum: " << (a + b) << endl;
    return 0;
}`,
      output: 'Sum: 30'
    },
    {
      id: 'cpp_3',
      title: 'Even or Odd',
      description: 'Check if 22 is even or odd.',
      code: `#include <iostream>
using namespace std;

int main() {
    int num = 22;
    if (num % 2 == 0) {
        cout << "Even" << endl;
    } else {
        cout << "Odd" << endl;
    }
    return 0;
}`,
      output: 'Even'
    },
    {
      id: 'cpp_4',
      title: 'Factorial',
      description: 'Find factorial of 6.',
      code: `#include <iostream>
using namespace std;

int main() {
    int num = 6;
    long factorial = 1;
    for (int i = 1; i <= num; i++) {
        factorial *= i;
    }
    cout << "Factorial: " << factorial << endl;
    return 0;
}`,
      output: 'Factorial: 720'
    },
    {
      id: 'cpp_5',
      title: 'Fibonacci Series',
      description: 'First 6 numbers in Fibonacci sequence.',
      code: `#include <iostream>
using namespace std;

int main() {
    int n = 6, t1 = 0, t2 = 1, nextTerm = 0;
    for (int i = 1; i <= n; ++i) {
        cout << t1 << " ";
        nextTerm = t1 + t2;
        t1 = t2;
        t2 = nextTerm;
    }
    cout << endl;
    return 0;
}`,
      output: '0 1 1 2 3 5'
    },
    {
      id: 'cpp_6',
      title: 'Prime Number Check',
      description: 'Check if 29 is prime.',
      code: `#include <iostream>
using namespace std;

int main() {
    int num = 29;
    bool isPrime = true;
    for (int i = 2; i <= num / 2; ++i) {
        if (num % i == 0) {
            isPrime = false;
            break;
        }
    }
    if (isPrime)
        cout << "Prime" << endl;
    else
        cout << "Not Prime" << endl;
    return 0;
}`,
      output: 'Prime'
    },
    {
      id: 'cpp_7',
      title: 'Reverse a String',
      description: 'Reverse string "CPPPlayground".',
      code: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    string str = "CPPPlayground";
    reverse(str.begin(), str.end());
    cout << "Reversed: " << str << endl;
    return 0;
}`,
      output: 'Reversed: dnuorgyalPPPC'
    },
    {
      id: 'cpp_8',
      title: 'Largest in Array',
      description: 'Find max of array {3, 9, 2, 25, 11}.',
      code: `#include <iostream>
using namespace std;

int main() {
    int arr[] = {3, 9, 2, 25, 11};
    int max = arr[0];
    for(int i = 1; i < 5; i++) {
        if(arr[i] > max) max = arr[i];
    }
    cout << "Largest: " << max << endl;
    return 0;
}`,
      output: 'Largest: 25'
    },
    {
      id: 'cpp_9',
      title: 'Check Leap Year',
      description: 'Check if year 2024 is a leap year.',
      code: `#include <iostream>
using namespace std;

int main() {
    int year = 2024;
    if (year % 4 == 0) {
        if (year % 100 == 0) {
            if (year % 400 == 0) cout << "Leap Year" << endl;
            else cout << "Not Leap Year" << endl;
        } else cout << "Leap Year" << endl;
    } else cout << "Not Leap Year" << endl;
    return 0;
}`,
      output: 'Leap Year'
    },
    {
      id: 'cpp_10',
      title: 'Count Vowels',
      description: 'Count vowels in "Computer".',
      code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string str = "Computer";
    int vowels = 0;
    for(char c : str) {
        char lower = tolower(c);
        if(lower=='a' || lower=='e' || lower=='i' || lower=='o' || lower=='u') {
            vowels++;
        }
    }
    cout << "Vowels: " << vowels << endl;
    return 0;
}`,
      output: 'Vowels: 3'
    }
  ],
  java: [
    {
      id: 'java_1',
      title: 'Hello World',
      description: 'Print "Hello, World!" in Java.',
      code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
      output: 'Hello, World!'
    },
    {
      id: 'java_2',
      title: 'Add Two Numbers',
      description: 'Print sum of 40 and 60.',
      code: `public class Main {
    public static void main(String[] args) {
        int a = 40, b = 60;
        System.out.println("Sum: " + (a + b));
    }
}`,
      output: 'Sum: 100'
    },
    {
      id: 'java_3',
      title: 'Even or Odd',
      description: 'Check if 19 is even or odd.',
      code: `public class Main {
    public static void main(String[] args) {
        int num = 19;
        if (num % 2 == 0) {
            System.out.println("Even");
        } else {
            System.out.println("Odd");
        }
    }
}`,
      output: 'Odd'
    },
    {
      id: 'java_4',
      title: 'Factorial',
      description: 'Calculate factorial of 5.',
      code: `public class Main {
    public static void main(String[] args) {
        int num = 5;
        int factorial = 1;
        for (int i = 1; i <= num; i++) {
            factorial *= i;
        }
        System.out.println("Factorial: " + factorial);
    }
}`,
      output: 'Factorial: 120'
    },
    {
      id: 'java_5',
      title: 'Fibonacci Series',
      description: 'First 5 Fibonacci numbers.',
      code: `public class Main {
    public static void main(String[] args) {
        int n = 5, t1 = 0, t2 = 1;
        for (int i = 1; i <= n; ++i) {
            System.out.print(t1 + " ");
            int sum = t1 + t2;
            t1 = t2;
            t2 = sum;
        }
        System.out.println();
    }
}`,
      output: '0 1 1 2 3 '
    },
    {
      id: 'java_6',
      title: 'Prime Number Check',
      description: 'Check if 13 is prime.',
      code: `public class Main {
    public static void main(String[] args) {
        int num = 13;
        boolean isPrime = true;
        for (int i = 2; i <= num / 2; i++) {
            if (num % i == 0) {
                isPrime = false;
                break;
            }
        }
        if (isPrime) {
            System.out.println("Prime");
        } else {
            System.out.println("Not Prime");
        }
    }
}`,
      output: 'Prime'
    },
    {
      id: 'java_7',
      title: 'Reverse a String',
      description: 'Reverse string "JavaCode" using StringBuilder.',
      code: `public class Main {
    public static void main(String[] args) {
        String str = "JavaCode";
        StringBuilder sb = new StringBuilder(str);
        System.out.println("Reversed: " + sb.reverse().toString());
    }
}`,
      output: 'Reversed: edoCavaJ'
    },
    {
      id: 'java_8',
      title: 'Largest in Array',
      description: 'Find max of array {7, 15, 3, 22, 9}.',
      code: `public class Main {
    public static void main(String[] args) {
        int[] arr = {7, 15, 3, 22, 9};
        int max = arr[0];
        for (int i = 1; i < arr.length; i++) {
            if (arr[i] > max) max = arr[i];
        }
        System.out.println("Max: " + max);
    }
}`,
      output: 'Max: 22'
    },
    {
      id: 'java_9',
      title: 'Check Palindrome',
      description: 'Check if string "madam" is palindrome.',
      code: `public class Main {
    public static void main(String[] args) {
        String str = "madam";
        String rev = new StringBuilder(str).reverse().toString();
        if (str.equals(rev)) {
            System.out.println("Palindrome");
        } else {
            System.out.println("Not Palindrome");
        }
    }
}`,
      output: 'Palindrome'
    },
    {
      id: 'java_10',
      title: 'Bubble Sort',
      description: 'Sort array {5, 1, 4, 2, 8} using Bubble Sort.',
      code: `public class Main {
    public static void main(String[] args) {
        int[] arr = {5, 1, 4, 2, 8};
        int n = arr.length;
        for (int i = 0; i < n-1; i++) {
            for (int j = 0; j < n-i-1; j++) {
                if (arr[j] > arr[j+1]) {
                    int temp = arr[j];
                    arr[j] = arr[j+1];
                    arr[j+1] = temp;
                }
            }
        }
        for (int num : arr) {
            System.out.print(num + " ");
        }
        System.out.println();
    }
}`,
      output: '1 2 4 5 8 '
    }
  ]
};

export default function Playground() {
  const { isDark, colors } = useTheme();
  const styles = getStyles(colors);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const params = useLocalSearchParams();

  const [language, setLanguage] = useState<keyof typeof TEMPLATES>('python');
  const [code, setCode] = useState(TEMPLATES.python);
  const [output, setOutput] = useState('');
  const [errorLog, setErrorLog] = useState('');
  const [compilerMissing, setCompilerMissing] = useState(false);
  const [running, setRunning] = useState(false);
  const [lineNumbers, setLineNumbers] = useState('1');
  const [editorHeight, setEditorHeight] = useState(400);
  const [runSource, setRunSource] = useState<'local' | 'cloud' | null>(null);
  const [practiceModalVisible, setPracticeModalVisible] = useState(false);
  const [referenceCode, setReferenceCode] = useState('');
  const [showReferenceCode, setShowReferenceCode] = useState(false);

  // Handle params passed from flashcards
  useEffect(() => {
    if (params.language) {
      const langParam = String(params.language).toLowerCase() as keyof typeof TEMPLATES;
      if (TEMPLATES[langParam]) {
        setLanguage(langParam);
        setCode(TEMPLATES[langParam]);
        if (params.code) {
          setReferenceCode(String(params.code));
          setShowReferenceCode(true);
        } else {
          setReferenceCode('');
          setShowReferenceCode(false);
        }
      }
    }
  }, [params.language, params.code]);

  // Update code when language changes
  const handleLanguageChange = (lang: keyof typeof TEMPLATES) => {
    setLanguage(lang);
    setCode(TEMPLATES[lang]);
    setOutput('');
    setErrorLog('');
    setCompilerMissing(false);
  };

  // Compute line numbers on code text change
  useEffect(() => {
    const lines = code.split('\n').length;
    const nums = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
    setLineNumbers(nums);
  }, [code]);

  const handleRunCode = async () => {
    if (running) return;

    setRunning(true);
    setOutput('Running code...\n');
    setErrorLog('');
    setCompilerMissing(false);
    setRunSource(null);

    try {
      const response = await fetch(`${API_URL}/api/playground/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          language,
          code
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOutput(data.stdout || '(Execution completed with no output logs)');
          setRunSource(data.runSource || 'local');
        } else {
          setOutput(data.stdout || '');
          setRunSource(data.runSource || null);
          if (data.error === 'COMPILER_MISSING') {
            setCompilerMissing(true);
            setErrorLog(`Warning: System missing compiler/interpreter for ${language.toUpperCase()}`);
          } else if (data.error === 'TIMEOUT') {
            setErrorLog('Execution Timeout: 5 seconds runtime limit exceeded.');
          } else {
            setErrorLog(data.stderr || data.error || 'Execution failed.');
          }
        }
      } else {
        const errorText = await response.text();
        setErrorLog(`Server error: ${response.status} - ${errorText || 'Internal Server Error'}`);
      }
    } catch (err) {
      console.log('Error running code:', err);
      setErrorLog('Failed to connect to compiler server. Please verify your backend server is running.');
    } finally {
      setRunning(false);
    }
  };

  const handleReset = () => {
    setCode(TEMPLATES[language]);
    setOutput('');
    setErrorLog('');
    setCompilerMissing(false);
    setRunSource(null);
  };

  const languages: { key: keyof typeof TEMPLATES; name: string; icon: string }[] = [
    { key: 'python', name: 'Python', icon: 'logo-python' },
    { key: 'c', name: 'C Lang', icon: 'code-slash-outline' },
    { key: 'cpp', name: 'C++', icon: 'settings-outline' },
    { key: 'java', name: 'Java', icon: 'cafe-outline' }
  ];

  return (
    <LinearGradient
      colors={isDark ? ['#0b0f19', '#1e293b'] : ['#f8fafc', '#f1f5f9']}
      style={styles.container}
    >
      {/* Header Banner */}
      <LinearGradient
        colors={isDark ? ['#1e293b', '#0f172a'] : ['#05506b', '#0d9488']}
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

          <Text style={styles.headerTitle}>Interactive Playground</Text>

          <TouchableOpacity
            style={[styles.runBtn, running && styles.runBtnDisabled]}
            onPress={handleRunCode}
            disabled={running}
          >
            {running ? (
              <ActivityIndicator size="small" color="#fff" style={{ marginRight: 6 }} />
            ) : (
              <Ionicons name="play" size={18} color="#fff" style={{ marginRight: 6 }} />
            )}
            <Text style={styles.runBtnText}>{running ? 'Running...' : 'Run Code'}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Main Workspace layout */}
      <View style={[styles.workspace, isMobile && styles.workspaceMobile]}>

        {/* Left pane: Language Selector & Editor */}
        <View style={[styles.editorPane, isMobile && styles.editorPaneMobile]}>

          {/* Language Selector chips - Constrained Height to prevent stretching */}
          <View style={styles.langSelectorContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.langSelectorRow}
            >
              {languages.map((item) => {
                const active = language === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.langChip, active && styles.langChipActive]}
                    onPress={() => handleLanguageChange(item.key)}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={14}
                      color={active ? '#fff' : '#05506b'}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.langChipText, active && styles.langChipTextActive]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                style={styles.practiceBtn}
                onPress={() => setPracticeModalVisible(true)}
              >
                <Ionicons name="help-circle-outline" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.practiceBtnText}>Practice Questions</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* IDE Editor Console container */}
          <View style={[styles.ideWorkspace, isMobile && styles.ideWorkspaceMobile]}>
            {showReferenceCode && referenceCode ? (
              <View style={[styles.referencePane, isMobile && styles.referencePaneMobile]}>
                <View style={styles.referenceHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="code-working-outline" size={16} color="#10b981" />
                    <Text style={styles.referenceTitle}>Reference Code</Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowReferenceCode(false)}>
                    <Ionicons name="close" size={18} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.referenceScroll}>
                  <Text style={styles.referenceCodeText}>{referenceCode}</Text>
                </ScrollView>
              </View>
            ) : null}

            <View style={styles.ideContainer}>
              {/* Action Bar (Reset) */}
              <View style={styles.ideActionBar}>
                <Text style={styles.ideFilename}>
                  {language === 'java' ? 'Main.java' : `playground.${language === 'cpp' ? 'cpp' : language === 'c' ? 'c' : 'py'}`}
                </Text>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  {referenceCode ? (
                    <TouchableOpacity
                      style={styles.referenceToggleBtn}
                      onPress={() => setShowReferenceCode(!showReferenceCode)}
                    >
                      <Ionicons 
                        name={showReferenceCode ? "eye-off" : "eye"} 
                        size={14} 
                        color={showReferenceCode ? "#94a3b8" : "#10b981"} 
                        style={{ marginRight: 4 }} 
                      />
                      <Text style={[styles.referenceToggleBtnText, { color: showReferenceCode ? "#94a3b8" : "#10b981" }]}>
                        {showReferenceCode ? 'Hide Reference' : 'Show Reference'}
                      </Text>
                    </TouchableOpacity>
                  ) : null}

                  <TouchableOpacity
                    style={styles.resetBtn}
                    onPress={handleReset}
                  >
                    <Ionicons name="reload" size={14} color="#94a3b8" style={{ marginRight: 4 }} />
                    <Text style={styles.resetBtnText}>Reset Template</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Code inputs pane - Scrolling synchronized by single parent ScrollView */}
              <ScrollView
                style={styles.editorScroll}
                contentContainerStyle={styles.editorContent}
                showsVerticalScrollIndicator={true}
              >
                <View style={styles.editorContainer}>
                  <TextInput
                    multiline
                    value={lineNumbers}
                    style={[styles.lineNumbersText, { height: Math.max(400, editorHeight) }]}
                    editable={false}
                    scrollEnabled={false}
                  />

                  <TextInput
                    multiline
                    value={code}
                    onChangeText={setCode}
                    onContentSizeChange={(e) => {
                      setEditorHeight(e.nativeEvent.contentSize.height);
                    }}
                    style={[styles.codeInput, { height: Math.max(400, editorHeight) }]}
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect={false}
                    spellCheck={false}
                    placeholder="Write your code here..."
                    placeholderTextColor="#64748b"
                    scrollEnabled={false}
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        </View>

        {/* Right pane: Console Terminal */}
        <View style={[styles.consolePane, isMobile && styles.consolePaneMobile]}>
          <View style={styles.consoleHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="terminal-outline" size={16} color="#94a3b8" style={{ marginRight: 6 }} />
              <Text style={styles.consoleTitle}>Console Output</Text>

              {runSource === 'local' && (
                <View style={[styles.runSourceBadge, styles.runSourceBadgeLocal]}>
                  <Text style={styles.runSourceBadgeText}>💻 Local Run</Text>
                </View>
              )}
              {runSource === 'cloud' && (
                <View style={[styles.runSourceBadge, styles.runSourceBadgeCloud]}>
                  <Text style={styles.runSourceBadgeText}>☁️ Cloud Run</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={() => { setOutput(''); setErrorLog(''); setCompilerMissing(false); setRunSource(null); }}
              style={styles.clearBtn}
            >
              <Text style={styles.clearBtnText}>Clear Console</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.consoleScroll}
            contentContainerStyle={styles.consoleOutputContainer}
          >
            {output ? (
              <Text style={styles.consoleOutputText}>{output}</Text>
            ) : null}

            {errorLog ? (
              <Text style={styles.consoleErrorText}>{errorLog}</Text>
            ) : null}

            {compilerMissing && (
              <View style={styles.warningCard}>
                <View style={styles.warningHeader}>
                  <Ionicons name="warning" size={18} color="#b91c1c" />
                  <Text style={styles.warningTitle}>Compiler / Interpreter Not Found</Text>
                </View>
                <Text style={styles.warningText}>
                  The runtime environment for <Text style={{ fontWeight: 'bold' }}>{language.toUpperCase()}</Text> is not installed or configured on your system PATH.
                </Text>
                <View style={styles.solutionBox}>
                  <Text style={styles.solutionTitle}>💡 Quick Resolution:</Text>
                  {language === 'c' || language === 'cpp' ? (
                    <Text style={styles.solutionText}>
                      • Install GCC/MinGW (C/C++ compiler) and make sure it is added to your environment variables.
                    </Text>
                  ) : null}
                  {language === 'java' ? (
                    <Text style={styles.solutionText}>
                      • Install JDK (Java Development Kit) and verify that &apos;javac&apos; and &apos;java&apos; commands are on your system variables path.
                    </Text>
                  ) : null}
                  {language === 'python' ? (
                    <Text style={styles.solutionText}>
                      • Install Python from python.org. Check &quot;Add Python to PATH&quot; during installation.
                    </Text>
                  ) : null}
                </View>
              </View>
            )}

            {!output && !errorLog && !compilerMissing && (
              <Text style={styles.consolePlaceholder}>Click &quot;Run Code&quot; to compile and run your script...</Text>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Practice Questions Modal Overlay */}
      {practiceModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>

            {/* Modal Header */}
            <LinearGradient
              colors={isDark ? ['#1e293b', '#0f172a'] : ['#05506b', '#0d9488']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.modalHeader}
            >
              <View style={styles.modalHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Ionicons name="code-working-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.modalTitle}>Practice Questions ({language.toUpperCase()})</Text>
                </View>

                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setPracticeModalVisible(false)}
                >
                  <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalSubtitle}>
                Select a basic question to load it in the compiler playground
              </Text>
            </LinearGradient>

            {/* Modal Body */}
            <ScrollView style={styles.modalScroll}>
              <View style={styles.questionsContainer}>
                {PRACTICE_QUESTIONS[language]?.map((q, idx) => (
                  <View key={q.id} style={styles.questionCard}>
                    <View style={styles.questionHeader}>
                      <View style={styles.questionTitleRow}>
                        <View style={styles.questionIndexBadge}>
                          <Text style={styles.questionIndexText}>{idx + 1}</Text>
                        </View>
                        <Text style={styles.questionTitle}>{q.title}</Text>
                      </View>
                      <View style={styles.difficultyBadge}>
                        <Text style={styles.difficultyText}>Basic</Text>
                      </View>
                    </View>

                    <Text style={styles.questionDesc}>{q.description}</Text>

                    {/* Expected Output */}
                    <View style={styles.expectedOutputContainer}>
                      <Text style={styles.expectedOutputLabel}>Expected Output:</Text>
                      <Text style={styles.expectedOutputText}>{q.output}</Text>
                    </View>

                    {/* Action Button */}
                    <TouchableOpacity
                      style={styles.loadQuestionBtn}
                      onPress={() => {
                        setCode(q.code);
                        setPracticeModalVisible(false);
                        setOutput('');
                        setErrorLog('');
                        setCompilerMissing(false);
                        setRunSource(null);
                      }}
                    >
                      <Ionicons name="arrow-forward-outline" size={14} color="#fff" style={{ marginRight: 6 }} />
                      <Text style={styles.loadQuestionBtnText}>Load in Editor</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </LinearGradient>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  header: {
    paddingTop: Platform.OS === 'ios' ? 48 : 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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

  runBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },

  runBtnDisabled: {
    backgroundColor: '#059669',
    opacity: 0.8,
  },

  runBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },

  workspace: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },

  workspaceMobile: {
    flexDirection: 'column',
  },

  editorPane: {
    flex: 1.2,
    flexDirection: 'column',
  },

  editorPaneMobile: {
    flex: 1.5,
  },

  consolePane: {
    flex: 0.8,
    backgroundColor: '#090d16',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#1e293b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },

  consolePaneMobile: {
    flex: 1,
    minHeight: 220,
  },

  langSelectorContainer: {
    maxHeight: 50,
    height: 50,
    marginBottom: 12,
  },

  langSelectorRow: {
    paddingVertical: 2,
    paddingHorizontal: 2,
    gap: 10,
  },

  langChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    height: 38,
  },

  langChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },

  langChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },

  langChipTextActive: {
    color: '#ffffff',
  },

  ideWorkspace: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
  },

  ideWorkspaceMobile: {
    flexDirection: 'column',
  },

  referencePane: {
    flex: 0.8,
    backgroundColor: '#181825',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#313244',
    padding: 16,
  },

  referencePaneMobile: {
    flex: 1,
    maxHeight: 200,
  },

  referenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#313244',
    paddingBottom: 8,
    marginBottom: 12,
  },

  referenceTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#cdd6f4',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  referenceScroll: {
    flex: 1,
  },

  referenceCodeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 13,
    color: '#a6e3a1',
    lineHeight: 20,
  },

  referenceToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  referenceToggleBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },

  ideContainer: {
    flex: 1,
    backgroundColor: '#1e1e2e',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#313244',
  },

  ideActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#11111b',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#313244',
  },

  ideFilename: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#a6adc8',
    fontWeight: '600',
  },

  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  resetBtnText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },

  editorScroll: {
    flex: 1,
  },

  editorContent: {
    flexGrow: 1,
  },

  editorContainer: {
    flex: 1,
    flexDirection: 'row',
  },

  lineNumbersText: {
    width: 42,
    backgroundColor: '#11111b',
    borderRightWidth: 1,
    borderRightColor: '#313244',
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#585b70',
    textAlign: 'right',
    paddingRight: 10,
    paddingVertical: 12,
    lineHeight: 22,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        userSelect: 'none',
        outlineStyle: 'none',
        overflow: 'hidden',
      } as any,
    }),
  },

  codeInput: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#cdd6f4',
    paddingHorizontal: 16,
    paddingVertical: 12,
    lineHeight: 22,
    textAlignVertical: 'top',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        boxShadow: 'none',
      } as any,
    }),
  },

  consoleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#050911',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },

  consoleTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },

  clearBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },

  clearBtnText: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
  },

  consoleScroll: {
    flex: 1,
    backgroundColor: '#090d16',
  },

  consoleOutputContainer: {
    padding: 16,
  },

  consoleOutputText: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#a6e22e',
    lineHeight: 20,
    whiteSpace: 'pre-wrap',
  } as any,

  consoleErrorText: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#f92672',
    lineHeight: 20,
    whiteSpace: 'pre-wrap',
  } as any,

  consolePlaceholder: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    marginTop: 20,
  },

  runSourceBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    marginLeft: 8,
  },

  runSourceBadgeLocal: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },

  runSourceBadgeCloud: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },

  runSourceBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
  },

  warningCard: {
    backgroundColor: '#1e1b4b',
    borderColor: '#312e81',
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
  },

  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fecaca',
    marginLeft: 8,
  },

  warningText: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 18,
    marginBottom: 12,
  },

  solutionBox: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 8,
    padding: 10,
  },

  solutionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38bdf8',
    marginBottom: 6,
  },

  solutionText: {
    fontSize: 11,
    color: '#9ca3af',
    lineHeight: 16,
  },

  practiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: colors.accent,
    borderWidth: 1.5,
    borderColor: colors.accent,
    height: 38,
    marginLeft: 6,
  },

  practiceBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },

  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: 16,
  },

  modalContent: {
    width: '100%',
    maxWidth: 720,
    maxHeight: '85%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 10,
  },

  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    flex: 1,
  },

  modalSubtitle: {
    fontSize: 13,
    color: '#ccfbf1',
    opacity: 0.9,
    lineHeight: 18,
  },

  modalCloseBtn: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },

  modalScroll: {
    flex: 1,
  },

  questionsContainer: {
    padding: 16,
    gap: 16,
  },

  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 10,
  },

  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  questionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },

  questionIndexBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },

  questionIndexText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },

  questionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },

  difficultyBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#065f46',
    borderWidth: 1,
    borderColor: '#059669',
  },

  difficultyText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34d399',
    textTransform: 'uppercase',
  },

  questionDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  expectedOutputContainer: {
    backgroundColor: colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },

  expectedOutputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  expectedOutputText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#10b981',
    lineHeight: 16,
  },

  loadQuestionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.accent,
    borderWidth: 1,
    borderColor: colors.accent,
    marginTop: 4,
  },

  loadQuestionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});
