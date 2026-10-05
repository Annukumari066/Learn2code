// Learn2Code Java Playground
// Note: Keep class name as Main
import java.util.*;

public class Main {
    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);

        System.out.print("Enter first digit: ");
        int a = sc.nextInt();

        System.out.print("Enter second digit: ");
        int b = sc.nextInt();

        int sum = a + b;

        System.out.println("Sum = " + sum);

        sc.close();
    }
}
