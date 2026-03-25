// CrownCare — Serverless Email Escalation Service
// Uses EmailJS REST API to bypass backend requirements for support tickets

const EMAILJS_SERVICE_ID = 'service_crowncare'; // Replace with actual Service ID
const EMAILJS_TEMPLATE_ID = 'template_escalation'; // Replace with actual Template ID
const EMAILJS_PUBLIC_KEY = 'user_dummy_key'; // Replace with actual Public Key

/**
 * Dispatches an escalation ticket to the founder's email.
 * @param {string} userName - The name of the user requesting help.
 * @param {string} triggerReason - Why the ticket was created (e.g., "Requested Human", "AI Timeout").
 * @param {string} lastQuestion - The specific question the user asked.
 * @param {Array} chatHistory - The recent chat context to help the founder debug.
 */
export async function sendEscalationEmail(userName, triggerReason, lastQuestion, chatHistory) {
    // Format the chat history into a readable string for the email body
    const formattedHistory = chatHistory
        .slice(-5) // Send the last 5 messages for context
        .map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.text}`)
        .join('\n\n');

    const templateParams = {
        to_email: 'mlwhittle@gmail.com',
        user_name: userName,
        trigger_reason: triggerReason,
        user_question: lastQuestion,
        chat_context: formattedHistory,
        timestamp: new Date().toLocaleString()
    };

    try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                service_id: EMAILJS_SERVICE_ID,
                template_id: EMAILJS_TEMPLATE_ID,
                user_id: EMAILJS_PUBLIC_KEY,
                template_params: templateParams
            })
        });

        if (!response.ok) {
            console.error('EmailJS Error:', await response.text());
            throw new Error('Failed to dispatch escalation email.');
        }

        console.log('✅ Escalation ticket successfully sent to founder.');
        return true;
    } catch (error) {
        console.error('🚨 Escalation Delivery Failed:', error);
        return false;
    }
}
