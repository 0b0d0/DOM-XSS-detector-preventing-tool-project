 document.addEventListener("DOMContentLoaded",function(){
        const b1 = document.getElementById("b1"); // ON button
        const b2 = document.getElementById("b2"); // OFF button

    // To simulate the enabled/disabled state
    let isEnabled = true; // Start with the extension enabled

    // Update button visibility based on the current state
    function updateButtonVisibility() {
        if (isEnabled) {
            b1.style.display = "block";  // Show ON button
            b2.style.display = "none";   // Hide OFF button
        } else {
            b1.style.display = "none";   // Hide ON button
            b2.style.display = "block";   // Show OFF button
        }
    }

     //Initial check for extension's current state
    browser.management.get(extensionId).then((extensionInfo) => {
        updateButtonVisibility(extensionInfo.enabled);
    }).catch(err => {
        console.error("Error getting extension status:", err);
    });

    // Add event listener for the ON button
    /*browser.management API turns the extension ON or OFF*/
    b1.addEventListener("click", function() {
        browser.management.disable(extensionId).then(() => {
            alert("TURNED OFF");
            updateButtonVisibility(false); // Update display to OFF
        }).catch(err => {
            console.error("Could not disable extension:", err);
        });
    });

    // Add event listener for the OFF button
    b2.addEventListener("click", function() {
        browser.management.enable(extensionId).then(() => {
            alert("TURNED ON");
            updateButtonVisibility(true); // Update display to ON
        }).catch(err => {
            console.error("Could not enable extension:", err);
        });
    });

    // Initialize button visibility based on the initial state
    updateButtonVisibility();
    });
