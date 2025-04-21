import { firebaseConfig } from './hoftapsFirebaseConfig.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
// Import necessary Firestore functions, including getDoc for verification
import { getFirestore, collection, query, where, onSnapshot, writeBatch, doc, updateDoc, arrayUnion, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

// Keep track of the Firestore listener so we can unsubscribe on logout
let unsubscribeNotifications = null;
let currentUnreadMessages = []; // Keep track of unread message IDs

// Function to update the notification badges (NO CHANGES NEEDED HERE)
function updateNotificationBadges(unreadCount) {
    const topBadge = document.querySelector(".sidebar-toggle-wrapper .notifBtn");
    const sidebarBadge = document.querySelector(".offcanvas-header .notifBtn2");
    if (!topBadge || !sidebarBadge) { return; }
    if (unreadCount > 0) {
        topBadge.style.display = "inline-block";
        sidebarBadge.style.display = "flex";
        const countText = unreadCount > 9 ? "9+" : unreadCount.toString();
        topBadge.innerText = countText;
        sidebarBadge.innerText = countText;
    } else {
        topBadge.style.display = "none";
        sidebarBadge.style.display = "none";
        topBadge.innerText = "";
        sidebarBadge.innerText = "";
    }
}

// Listen for Authentication changes
onAuthStateChanged(auth, (user) => {
    if (unsubscribeNotifications) {
        unsubscribeNotifications();
        unsubscribeNotifications = null;
        console.log("[Auth Change] Unsubscribed from notification listener.");
    }
    updateNotificationBadges(0);
    currentUnreadMessages = [];

    if (user) {
        console.log(`[Auth Change] User ${user.uid} signed in. Setting up listener.`);
        const q = query(
            collection(db, "messages"),
            where("sentToId", "==", user.uid)
        );

        unsubscribeNotifications = onSnapshot(q, (snapshot) => {
            let unreadCount = 0;
            const newUnreadMessages = [];
            const readMessages = []; // Track messages considered read in this snapshot
            const archivedMessages = []; // Track messages considered archived

            console.log(`[Snapshot] Received ${snapshot.docs.length} docs for user ${user.uid}.`);

            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                const isRead = data.readBy?.includes(user.uid);
                const isArchived = data.archivedBy?.includes(user.uid);

                // Detailed Log for each message processed
                console.log(`[Snapshot] Processing Msg ID: ${docSnap.id} -> read: ${isRead}, archived: ${isArchived}`);
                // console.log(`[Snapshot] Msg Data:`, data); // Uncomment for full data if needed

                if (!isRead && !isArchived) {
                    console.log(`[Snapshot] ---> COUNTING Msg ID: ${docSnap.id} as UNREAD`);
                    unreadCount++;
                    newUnreadMessages.push(docSnap.id);
                } else {
                    if (isRead) readMessages.push(docSnap.id);
                    if (isArchived) archivedMessages.push(docSnap.id);
                }
            });

            console.log(`[Snapshot] Final count: ${unreadCount}. Unread IDs: [${newUnreadMessages.join(', ')}]. Read IDs: [${readMessages.join(', ')}]. Archived IDs: [${archivedMessages.join(', ')}]`);
            currentUnreadMessages = newUnreadMessages; // Update the list for the click handler
            updateNotificationBadges(unreadCount);

        }, (error) => {
            console.error("[Snapshot Error] Error listening for notifications:", error);
            updateNotificationBadges(0);
            currentUnreadMessages = [];
        });

    } else {
        console.log("[Auth Change] User signed out.");
    }
});


// --- Logic to handle click on the Notifications link ---
document.addEventListener('DOMContentLoaded', () => {
    const notificationsLink = document.querySelector('.offcanvas-body a[href="HTAPNotifications.html"]');

    if (notificationsLink) {
        notificationsLink.addEventListener('click', async (event) => {
            event.preventDefault(); // Prevent immediate navigation

            console.log("[Click Handler] Notifications link clicked.");

            const user = auth.currentUser;
            if (!user) {
                console.warn("[Click Handler] No user logged in. Hiding badge visually.");
                updateNotificationBadges(0); // Hide visually only
                window.location.href = "HTAPNotifications.html"; // Redirect immediately
                return;
            }

            const messagesToMark = [...currentUnreadMessages]; // Copy the array

            if (messagesToMark.length > 0) {
                console.log(`[Click Handler] Attempting to mark ${messagesToMark.length} messages as read: [${messagesToMark.join(', ')}]`);
                const batch = writeBatch(db);
                const userId = user.uid;

                messagesToMark.forEach(messageId => {
                    const msgRef = doc(db, "messages", messageId);
                    batch.update(msgRef, { readBy: arrayUnion(userId) });
                });

                try {
                    await batch.commit(); // AWAIT the promise here!
                    console.log(`[Click Handler] Batch commit SUCCESSFUL for ${messagesToMark.length} messages.`);

                    updateNotificationBadges(0);
                    currentUnreadMessages = currentUnreadMessages.filter(id => !messagesToMark.includes(id));

                    // NOW redirect after the promise resolves
                    window.location.href = "HTAPNotifications.html";

                } catch (error) {
                    console.error("[Click Handler] !!! Batch commit FAILED:", error);
                    // Consider showing an error message to the user instead of just redirecting
                    // For now, let's still redirect so they can see the notifications,
                    // even if the badge didn't update perfectly.
                    window.location.href = "HTAPNotifications.html";
                }
            } else {
                console.log("[Click Handler] No tracked unread messages to mark. Hiding badge visually and redirecting.");
                updateNotificationBadges(0); // Hide badge if count was already 0 or list was empty
                window.location.href = "HTAPNotifications.html"; // Redirect immediately
            }
        });
        console.log("[DOM Ready] Added click listener to Notifications link.");
    } else {
        console.log("[DOM Ready] Notifications link not found on this page.");
    }
});
// --- END OF MODIFIED CODE ---


// Initial check (NO CHANGES NEEDED HERE)
const initialUser = auth.currentUser;
if (!initialUser && unsubscribeNotifications) {
   unsubscribeNotifications();
   unsubscribeNotifications = null;
   updateNotificationBadges(0);
   currentUnreadMessages = [];
}



  