console.log("Email Writer Extension - Content Script Loaded ");


function createAIButton(){
    const button = document.createElement('div');
    button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';
    button.style.marginRight = '8px';
    button.innerHTML = 'AI Reply';
    button.setAttribute('role','button');
    button.setAttribute('data-tooltip','Generate AI Reply');
    return button;
    }

function getEmailContent(){
    const selectors =[
        '.h7',
        '.a3s.aiL',
        '.gmail_qoute',
        '[role="presentation"]'
        
    ];
    for (const selector of selectors) {
        const content =document.querySelector(selector);
            if(content){
                return content.innerText.trim();
            }
        
            return '';
        }
    }

   


function findComposeToolbar(){
    const selectors =['.btC','.aDh','[role="toolbar"]','.gU.Up','[aria-label="Toolbar"]'];
    for (const selector of selectors) {
        const toolbar =document.querySelector(selector);
            if(toolbar){
                console.log(`Toolbar found with selector: ${selector}`);
                return toolbar;
            }
        }
            console.log("No toolbar found");
            return null;
        }
        async function getComposeBox(retries = 10) {
            for (let i = 0; i < retries; i++) {
                const composeBox = document.querySelector('[aria-label="Message Body"], div[role="textbox"]');
                if (composeBox) return composeBox;
                console.log('Retry ${i + 1}: Compose box not found, waiting...');
                await new Promise(resolve => setTimeout(resolve, 300)); // Wait 300ms before retrying
            }
            console.error(" Compose box was not found after multiple attempts.");
            return null;
        }
        


function injectButton(){
    const existingButton = document.querySelector('.ai-reply-button')
    if(existingButton) existingButton.remove();

    const toolbar = findComposeToolbar();
    if(!toolbar){
        console.log("Toolbar not found");
        return;
    }
    console.log("Toolbar found, creating AI button");
    const button = createAIButton();
    button.classList.add('ai-button-reply');

    button.addEventListener('click', async() =>{

        try{
            button.innerHTML = 'Generating...';
            button.disabled = true;
            const emailContent = getEmailContent()
            const response = await fetch('http://localhost:8080/api/email/generate', {
                method:'POST',
                headers: {
                    'Content-Type': 'application/json',
                
                },
                body: JSON.stringify({
                    emailContent: emailContent  || "Default test email",
                    tone: "professional"
                })
            });
            console.log("API Response: ", response);

            if(!response.ok){
                throw new Error('API Request Failed');
            }

           const generatedReply = await response.text();
           const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');
           console.log("Generated Reply: ", generatedReply);

          // const composeBox = document.querySelector('[aria-label="Message Body"], div[role="textbox"]');
          //const composeBox = await getComposeBox();

            if(composeBox){
                composeBox.focus();
                document.execCommand('insertText', false, generatedReply);
                //const event = new InputEvent('input', {bubbles: true});
                //composeBox.dispatchEvent(event);
                //composeBox.textContent = generatedReply;
                //composeBox.innerHTML = generatedReply;
               
            }else{
                console.error('Compose box was not found');
            }

        }catch(error){
            console.error(error);
            alert.error('Failed to generate reply');
        }
        finally{
            button.innerHTML = 'AI Reply';
            button.disabled = false;
        }
});

toolbar.insertBefore(button, toolbar.firstChild);

}

const observer = new MutationObserver((mutations) => {
    for(const mutation of mutations){
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElements = addedNodes.some(node =>
            node.nodeType ===Node.ELEMENT_NODE && 
            (node.matches('.aDh, .btC, [role="dialog"]') || node.querySelector('.aDh, .btC, [role="dialog"]'))
        );

        if(hasComposeElements){
            console.log("Compose Window Detected")
            setTimeout(() => injectButton(10), 500);
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
