/**
 * Level 2 Questions — Debugging (MCQ with Code Options)
 *
 * UI: Same as Level 1
 * Logic: Same as existing Level 2
 * Change: OPTIONS ARE CODE SNIPPETS (formatted, confusing, realistic)
 */

export const level2Questions = [
  {
    id: 1,
    type: "MCQ",
    prompt: `The following Python function checks if a string is a palindrome,
ignoring non-alphanumeric characters. However, it fails for some inputs.

What is the actual bug in the logic?`,

    code: `def isPalindrome(s):
    s = s.lower()
    l, r = 0, len(s) - 1

    while l < r:
        if not s[l].isalnum():
            l += 1
        if not s[r].isalnum():
            r -= 1
        if s[l] != s[r]:
            return False
        l += 1
        r -= 1
    return True`,

    options: [
      `if not s[l].isalnum():
    l += 1
if not s[r].isalnum():
    r -= 1`,

      `if not s[l].isalnum():
    l += 1
    continue
if not s[r].isalnum():
    r -= 1
    continue`,

      `if s[l] != s[r]:
    l += 1
    r -= 1`,

      `while l <= r:
    if s[l] != s[r]:
        return False`
    ],

    correctAnswer: `if not s[l].isalnum():
    l += 1
    continue
if not s[r].isalnum():
    r -= 1
    continue`,

    timeLimit: 120,
    points: 50
  },

  {
    id: 2,
    type: "MCQ",
    prompt: `The following C program checks whether parentheses are balanced.

It produces incorrect output for some inputs.
What fix is missing?`,

    code: `for(int i = 0; i < strlen(s); i++) {
    if(s[i] == '(' || s[i] == '{' || s[i] == '[') {
        stack[++top] = s[i];
    } else {
        if(top == -1) {
            printf("Not Balanced");
            return 0;
        }
        char ch = stack[top--];
        if(s[i] == ')' && ch != '(' ||
           s[i] == '}' && ch != '{' ||
           s[i] == ']' && ch != '[') {
            printf("Not Balanced");
            return 0;
        }
    }
}
printf("Balanced");`,

    options: [
      `if(top == 0)
    printf("Balanced");`,

      `if(top != -1) {
    printf("Not Balanced");
    return 0;
}`,

      `top = 0;
printf("Balanced");`,

      `continue;`
    ],

    correctAnswer: `if(top != -1) {
    printf("Not Balanced");
    return 0;
}`,

    timeLimit: 120,
    points: 50
  }
];

export default level2Questions;
