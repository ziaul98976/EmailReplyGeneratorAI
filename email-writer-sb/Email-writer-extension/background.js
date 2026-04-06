chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "generateReply") {
        fetch("http://localhost:8080/api/email/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "emailContent": request.emailContent || "Default test email",
                "tone": "professional"
            })
        })
        .then(response => response.text())
        .then(data => {
            console.log("✅ AI Reply Received:", data);
            sendResponse({ success: true, reply: data });
        })
        .catch(error => {
            console.error("❌ Error in API Call:", error);
            sendResponse({ success: false, error: error.toString() });
        });

        return true; // Required for async `sendResponse`
    }
});
