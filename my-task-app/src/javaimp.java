import java.util.Scanner;

public class javaimp{
    static class student {
        int roll;
        String name;

    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
         System.out.println("enter number of students");
         int count = sc.nextInt();
         student[] students = new student[count];


         for (int i = 0 ; i < count; i++){
            students[i]= new student();
         

          System.out.println("enter details for student :" + (i+1)); 
              

          System.out.println("enter ROLLNO:");
          students[i].roll = sc.nextInt();
          sc.nextLine();
           System.out.println("enter name:");
           students[i].name = sc.nextLine();
         }
        
        System.out.println("student details");
     for (student s : students ) {
        System.out.println("ROLLNO: "+ s.roll);
        System.out.println("NAME:"+ s.name);
         
     }
    }
}