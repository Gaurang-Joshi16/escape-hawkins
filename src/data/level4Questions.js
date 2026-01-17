/**
 * Level 4 Questions — SCENARIO-BASED MCQs
 * 
 * Structure:
 * - One scenario block (context)
 * - 4 MCQ questions based on the scenario
 * - All displayed in single scroll view
 * - Single submit button
 * 
 * Threshold: 3/4 correct to unlock hint
 */

export const level4Scenario = {
    title: "The Upside Down Network",
    description: `You are investigating a mysterious network breach at Hawkins Lab. 
The security logs show unusual activity, and you need to analyze the situation to prevent further damage.

The network administrator reports:
- Multiple failed login attempts from an unknown IP address
- A suspicious process running with elevated privileges
- Encrypted files appearing in the research directory
- Network traffic spike during off-hours

Your task is to answer the following questions based on this scenario.`
};

export const level4Questions = [
    {
        id: 1,
        type: 'MCQ',
        text: 'What type of attack is most likely occurring based on the failed login attempts?',
        options: [
            { id: 'A', text: 'SQL Injection' },
            { id: 'B', text: 'Brute Force Attack' },
            { id: 'C', text: 'Cross-Site Scripting (XSS)' },
            { id: 'D', text: 'Man-in-the-Middle Attack' }
        ],
        correctAnswer: 'Brute Force Attack',
        points: 10,
        timeLimit: 120 // 2 minutes for all 4 questions total
    },
    {
        id: 2,
        type: 'MCQ',
        text: 'The suspicious process with elevated privileges is most likely a:',
        options: [
            { id: 'A', text: 'Firewall' },
            { id: 'B', text: 'Antivirus Scanner' },
            { id: 'C', text: 'Rootkit or Backdoor' },
            { id: 'D', text: 'System Update Service' }
        ],
        correctAnswer: 'Rootkit or Backdoor',
        points: 10,
        timeLimit: 120
    },
    {
        id: 3,
        type: 'MCQ',
        text: 'What is the encrypted files appearing in the research directory most indicative of?',
        options: [
            { id: 'A', text: 'Ransomware Attack' },
            { id: 'B', text: 'Data Backup Process' },
            { id: 'C', text: 'System Encryption for Security' },
            { id: 'D', text: 'File Compression' }
        ],
        correctAnswer: 'Ransomware Attack',
        points: 10,
        timeLimit: 120
    },
    {
        id: 4,
        type: 'MCQ',
        text: 'What should be the FIRST immediate action to contain the breach?',
        options: [
            { id: 'A', text: 'Delete all encrypted files' },
            { id: 'B', text: 'Isolate affected systems from the network' },
            { id: 'C', text: 'Reset all user passwords' },
            { id: 'D', text: 'Install new antivirus software' }
        ],
        correctAnswer: 'Isolate affected systems from the network',
        points: 10,
        timeLimit: 120
    }
];

export default level4Questions;
