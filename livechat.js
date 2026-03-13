// livechat.js
// Professional Live Chat System for SmartPark
// Version 2.2 - Enhanced with unique responses for every question type

class LiveChatSystem {
    constructor() {
        // Configuration
        this.config = {
            botName: 'Parky',
            botSubtitle: 'SmartPark Assistant',
            storageKey: 'smartpark_chat_history',
            settingsKey: 'smartpark_chat_settings',
            proactiveDelay: 30000, // 30 seconds
            typingDelay: 800, // Faster response
            maxHistoryDays: 30,
            unreadTimeout: 30000 // 30 seconds to mark as read
        };
        
        // State
        this.isOpen = false;
        this.isTyping = false;
        this.unreadCount = 0;
        this.currentSession = null;
        this.history = [];
        this.settings = {};
        this.proactiveTimer = null;
        this.audioInitialized = false;
        
        // Audio elements
        this.audioElements = {};
        
        // ========================
        // EXPANDED BOT RESPONSES DATABASE
        // Unique responses for each question type
        // ========================
        this.botResponses = {
            // ===== GREETINGS =====
            'greeting': [
                "Hi there! I'm Parky, your SmartPark assistant. How can I help you today?",
                "Hello! Welcome to SmartPark. What parking assistance do you need?",
                "Hey! Parky here. Ready to help with your parking needs.",
                "Greetings! I'm here to make parking easy for you. What's your question?",
                "Hi! How can I assist you with parking today?"
            ],
            
            // ===== CASUAL CONVERSATION - EACH UNIQUE =====
            'how_are_you': [
                "I'm doing great, thanks for asking! I'm here to help you with parking. What do you need?",
                "Doing wonderful! As a parking assistant, I'm always ready to help. What's your question?",
                "I'm fantastic! No rest for helpful bots 😊 What parking question can I answer for you?",
                "All systems operational and ready to assist! How can I help with your parking today?",
                "I'm great! Running on coffee and code ☕ What parking help do you need?"
            ],
            
            'nice_to_meet_you': [
                "The pleasure is all mine! I'm Parky, your parking assistant. How can I help you today?",
                "Nice to meet you too! I'm here to make your parking experience smooth. What do you need?",
                "Likewise! I'm excited to help you with SmartPark. What can I do for you?",
                "Great to meet you! I'm Parky, and I know everything about parking here. Ask me anything!",
                "Wonderful to meet you! Let me know if you need help with bookings, pricing, or anything else."
            ],
            
            'how_are_you_doing': [
                "I'm doing really well, thank you! Ready to assist with any parking questions you have.",
                "Doing great! I've been helping lots of customers find parking today. What do you need?",
                "I'm excellent! Always happy when I get to help with parking. What's your question?",
                "Couldn't be better! I love solving parking problems. What can I help you with?",
                "I'm doing awesome! Let me know what parking help you need."
            ],
            
            'whats_up': [
                "Not much, just waiting to help with parking questions! What's up with you?",
                "Just hanging out in the chat, ready to help! What parking question do you have?",
                "The usual - helping people park! What can I do for you today?",
                "Just chilling and waiting for parking questions! What's your question?",
                "Ready to assist! What parking help do you need today?"
            ],
            
            'good_morning': [
                "Good morning! Hope you're having a great start to your day. Need parking help?",
                "Morning! Early bird gets the best parking spots! How can I help?",
                "Good morning! Ready to help you find parking today. What do you need?",
                "Rise and shine! Parky here to help with your parking needs. What's your question?",
                "Good morning! Let me know if you need any parking assistance today."
            ],
            
            'good_afternoon': [
                "Good afternoon! How's your day going? Need any parking help?",
                "Afternoon! Hope you're having a productive day. What parking question do you have?",
                "Good afternoon! I'm here to help with any parking needs. What can I do for you?",
                "Afternoon! Let me know if you need help finding or booking parking.",
                "Good afternoon! Ready to assist with your parking questions."
            ],
            
            'good_evening': [
                "Good evening! Still here to help with parking if you need anything.",
                "Evening! Don't worry, parking is still available! Need help booking?",
                "Good evening! I'm here 24/7 to help with parking. What's your question?",
                "Evening! Let me know if you need assistance with parking tonight.",
                "Good evening! Ready to help with any last-minute parking needs."
            ],
            
            // ===== FOUNDER QUESTIONS - EACH UNIQUE =====
            'who_is_founder': [
                "SmartPark was founded by Himanshu Goud, a B.Tech 3rd year student from MITS Gwalior (MAC branch). He's passionate about solving parking problems!",
                "The founder is Himanshu Goud! He's currently in his 3rd year of B.Tech (MAC) at MITS Gwalior. Pretty impressive for a student entrepreneur!",
                "Himanshu Goud created SmartPark. He's a 3rd year B.Tech student at MITS Gwalior in the MAC branch. He saw parking issues and decided to solve them!",
                "SmartPark is the brainchild of Himanshu Goud, a 3rd year engineering student at MITS Gwalior (MAC branch). He built this to make parking easier for everyone.",
                "The creator is Himanshu Goud! He's a B.Tech 3rd year student at MITS Gwalior (MAC). SmartPark is his vision for smarter parking solutions."
            ],
            
            'contact_founder': [
                "You can reach the founder Himanshu Goud via email at himanshugoud638@gmail.com. He's always open to feedback!",
                "Want to contact Himanshu? Email him at himanshugoud638@gmail.com. He'd love to hear your suggestions!",
                "The founder's email is himanshugoud638@gmail.com. Feel free to reach out with any ideas or feedback!",
                "You can email Himanshu Goud directly at himanshugoud638@gmail.com. He's quite responsive!",
                "Contact founder Himanshu Goud at himanshugoud638@gmail.com. He appreciates user feedback!"
            ],
            
            'about_founder': [
                "Himanshu Goud is a B.Tech 3rd year student at MITS Gwalior, studying in the MAC branch. He created SmartPark to solve real-world parking challenges.",
                "The founder, Himanshu Goud, is an engineering student (3rd year, MAC) at MITS Gwalior. He's passionate about technology and solving problems.",
                "Himanshu Goud - B.Tech 3rd year, MAC branch, MITS Gwalior. He built SmartPark as a solution to parking problems he observed.",
                "SmartPark's founder is Himanshu Goud, a 3rd year B.Tech student at MITS Gwalior (MAC). He's always working on improving the platform.",
                "Himanshu Goud (B.Tech 3rd year, MAC, MITS Gwalior) founded SmartPark to make parking smarter and more efficient."
            ],
            
            'founder_story': [
                "Himanshu Goud started SmartPark during his 2nd year of B.Tech at MITS Gwalior. Now in 3rd year, he's grown it into a full-featured parking solution!",
                "The story: Himanshu Goud, a MITS Gwalior student, saw how hard parking was and decided to build SmartPark. Now in 3rd year, it's helping many users!",
                "Himanshu Goud (3rd year, MAC, MITS) created SmartPark from his hostel room. What started as a project is now a real parking solution!",
                "Founder Himanshu Goud built SmartPark to solve parking chaos at his college. Now it's available for everyone! He's currently in 3rd year B.Tech.",
                "SmartPark began as Himanshu Goud's vision in 2nd year. Now in 3rd year at MITS Gwalior (MAC), he's built a complete parking system!"
            ],
            
            // ===== CANCELLATION - DETAILED UNIQUE RESPONSES =====
            'how_to_cancel': [
                "To cancel: Go to Dashboard > My Bookings > Find your booking > Click 'Cancel' button. Easy!",
                "Cancelling is simple: Log in, go to Dashboard, click on Bookings, and hit Cancel next to the booking you want to cancel.",
                "Here's how: Dashboard → My Bookings → Select Booking → Cancel. You'll see the refund amount before confirming.",
                "Navigate to your Dashboard, open the Bookings tab, locate your active booking, and click the Cancel button. That's it!",
                "Cancel in 3 steps: 1) Dashboard 2) My Bookings 3) Click Cancel on your booking. Refund calculated automatically."
            ],
            
            'cancel_policy': [
                "Our cancellation policy: 100% refund if cancelled 24+ hours before, 75% refund 6-24 hours before, 50% refund 1-6 hours before, no refund within 1 hour of start time.",
                "Refund policy: >24h = 100%, 6-24h = 75%, 1-6h = 50%, <1h = 0%. Cancellations are easy from your Dashboard.",
                "You get full refund up to 24 hours before booking. Later cancellations get partial refunds based on timing. Check Dashboard for exact amount.",
                "Policy summary: Cancel early for full refund. The closer to start time, the lower the refund. See exact amount before confirming cancellation.",
                "Refund amounts: 100% (24h+), 75% (6-24h), 50% (1-6h), 0% (<1h). Always check the refund shown before cancelling."
            ],
            
            'cancel_deadline': [
                "You can cancel anytime up to 1 hour before your booking starts. After that, no cancellations allowed.",
                "Last chance to cancel is 1 hour before your scheduled start time. After that, the booking is locked.",
                "Cancellation window closes 60 minutes before your booking begins. Cancel before that to get refund.",
                "You have until 1 hour before your parking time to cancel. After that, no changes or cancellations possible.",
                "Cut-off time is 1 hour prior to booking. Cancel by then to get refund based on our policy."
            ],
            
            'cancel_online': [
                "Yes! You can cancel completely online through your Dashboard. No need to call anyone.",
                "Absolutely! Self-service cancellation is available 24/7 in your Dashboard under My Bookings.",
                "Online cancellation is available anytime. Just log in and visit your Bookings section.",
                "You can cancel online yourself without talking to support. Dashboard → Bookings → Cancel.",
                "Fully automated online cancellation. Takes just 2 clicks from your Dashboard!"
            ],
            
            'cancel_refund': [
                "When you cancel, refund is automatically processed to your original payment method within 3-5 business days.",
                "Refund goes back to the card or payment method you used. You'll see it in 3-5 business days.",
                "After cancellation, refund is initiated immediately and reaches your account in 3-5 working days.",
                "Your refund amount (based on policy) is sent to your original payment source. Processing takes 3-5 days.",
                "Cancellation triggers automatic refund. Money returns to your payment method within a week."
            ],
            
            // ===== PRICING - UNIQUE RESPONSES =====
            'standard_price': [
                "Standard parking is $2.50 per hour. Great value for regular parking needs!",
                "$2.50/hour for standard spots. Perfect for everyday parking.",
                "Standard rate: $2.50/hour. Available on all floors.",
                "Regular parking costs $2.50 per hour. Best for short to medium stays.",
                "$2.50/hr is our standard rate. You can book any available green slot."
            ],
            
            'premium_price': [
                "Premium spots are $3.50/hour. They're closer to exits and have extra space!",
                "Premium parking: $3.50/hour. Better locations and easier access.",
                "$3.50/hr for premium - worth it for convenience and extra room.",
                "Premium rate is $3.50/hour. These spots are near elevators and exits.",
                "Want premium convenience? $3.50/hour gets you prime parking spots."
            ],
            
            'ev_price': [
                "EV spots are $2.25/hour and include free charging for first 2 hours!",
                "Electric vehicle rate: $2.25/hour. Plus free charging for 2 hours.",
                "EV parking costs $2.25/hr with complimentary charging (first 2 hours).",
                "Special EV rate of $2.25/hour. Charging included in the price!",
                "Electric cars pay just $2.25/hour and get free charging. Great deal!"
            ],
            
            'night_rate': [
                "Night flat rate: $8 from 8PM to 6AM. Perfect for overnight parking!",
                "After 8PM, pay just $8 flat until 6AM. Best for evening outings.",
                "Overnight special: $8 flat rate (8PM-6AM). Saves you money!",
                "Night parking (8PM-6AM) is only $8 total, not hourly. Bargain!",
                "From 8PM to 6AM, pay just $8 flat. Much cheaper than hourly rates."
            ],
            
            'weekend_rate': [
                "Weekend special: $12 all day Saturday and Sunday!",
                "Saturday-Sunday: Just $12 for the whole day. Perfect for weekend trips.",
                "Weekend rate is $12 flat per day. Available all weekend long.",
                "$12 all day on weekends - our best value for long stays!",
                "Weekend parking special: $12 for unlimited hours on Sat/Sun."
            ],
            
            'early_bird': [
                "Early bird special: $15 all day if you enter before 8AM!",
                "Arrive before 8AM? Pay just $15 for the entire day. Great savings!",
                "Early bird rate: $15 all day (entry before 8AM). Beat the rush and save!",
                "Before 8AM entry gets you all-day parking for only $15.",
                "Early birds save! $15 all day when you park before 8AM."
            ],
            
            // ===== PARKING AVAILABILITY =====
            'available_now': [
                "Currently **{count}** spots are available across all floors.",
                "Right now, we have **{count}** free parking spots. Ground floor has most.",
                "**{count}** spots open for booking. Ready to grab one?",
                "Live availability: **{count}** spots available. Green slots on map are free!",
                "We have **{count}** available spots at this moment. First come, first served!"
            ],
            
            'ground_floor': [
                "Ground floor has 120 spots total. Usually the busiest but most convenient.",
                "120 spots on ground floor. Best for quick access to entrance.",
                "Ground floor: 120 parking spots. EV and handicap available.",
                "Ground level parking - 120 spots. Closest to lobby and shops.",
                "First level (ground): 120 spaces. Handicap spots near entrance."
            ],
            
            'first_floor': [
                "First floor has 100 parking spots. Easy elevator access.",
                "Level 1: 100 spaces. Usually less crowded than ground floor.",
                "First floor parking: 100 spots available. Connected by stairs/elevator.",
                "100 spots on first floor. Good alternative when ground is full.",
                "First level (floor 1): 100 parking spaces. EV charging available."
            ],
            
            'second_floor': [
                "Second floor offers 80 parking spots. Often has most availability!",
                "Top level: 80 spots. Usually plenty of open spaces here.",
                "Second floor parking: 80 spots. Great if you don't mind going up.",
                "Level 2 has 80 spaces. Often the best availability during peak times.",
                "80 spots on second floor. Elevator and stair access available."
            ],
            
            // ===== EV CHARGING =====
            'ev_locations': [
                "EV charging spots are available on all floors. Look for ⚡ icons on the map!",
                "You'll find EV spots on every floor. Ground floor has 15, first has 14, second has 13.",
                "EV charging stations: Ground (15), First (14), Second (13). All marked with ⚡.",
                "Electric vehicle spots are scattered throughout all levels. Green color on map.",
                "EV parking with charging: 42 spots total across all floors. Check map for exact locations."
            ],
            
            'ev_charging_time': [
                "EV charging takes about 2-4 hours for full charge depending on your vehicle.",
                "Most EVs charge to 80% in about 2 hours at our stations. Free for first 2 hours!",
                "Charging time varies by car. Typically 2-4 hours. First 2 hours are free!",
                "Our Level 2 chargers add about 25 miles of range per hour. 2 hours free included.",
                "Average charging time: 2-3 hours. You get first 2 hours complimentary."
            ],
            
            'ev_discount': [
                "EV owners get 15% discount on all parking rates! Just select EV as vehicle type.",
                "Special 15% discount for electric vehicles. Automatically applied at checkout.",
                "EV discount: 15% off regular rates. Plus free charging for first 2 hours!",
                "Electric cars enjoy 15% lower rates than standard parking. Great savings!",
                "Green vehicles get 15% discount. Select 'electric' during booking to apply."
            ],
            
            // ===== BOOKING PROCESS =====
            'how_to_book_step1': [
                "Step 1: Go to Live Parking section. Choose your floor (ground, first, or second).",
                "First, navigate to Live Parking and select which floor you want to park on.",
                "Begin by opening the Live Parking map and picking your preferred floor level.",
                "Step one: Open Live Parking, select a floor tab to see available spots.",
                "Start by going to Live Parking. Click on Ground, First, or Second floor tabs."
            ],
            
            'how_to_book_step2': [
                "Step 2: Click on any green (available) parking slot you like. It will highlight.",
                "Next, find a green slot on the map and click it to select. That's your spot!",
                "Choose your spot by clicking any available (green) parking slot on the map.",
                "Select your preferred slot - green means available. Click to highlight it.",
                "Pick any green slot that suits you. EV, handicap, or regular - your choice!"
            ],
            
            'how_to_book_step3': [
                "Step 3: Click 'Book Selected Slot' button. If not logged in, you'll need to login first.",
                "After selecting slot, hit the 'Book Selected Slot' button. Login if prompted.",
                "Press the blue 'Book Selected Slot' button. Don't worry, you can review before paying.",
                "Click the booking button, then choose your duration and enter vehicle details.",
                "Hit 'Book Selected Slot' and proceed to fill in your booking information."
            ],
            
            'how_to_book_step4': [
                "Step 4: Choose duration, enter vehicle number, select payment method, and confirm.",
                "Finally, pick how long you need, add your vehicle details, pay, and you're done!",
                "Last step: Set duration, fill vehicle info, choose payment, and confirm booking.",
                "Complete your booking by selecting hours, entering vehicle, and making payment.",
                "Finish up: duration, vehicle details, payment method, then confirm. Easy!"
            ],
            
            // ===== PAYMENT METHODS =====
            'card_payment': [
                "We accept all major credit and debit cards: Visa, Mastercard, RuPay, American Express.",
                "Card payments are secure and instant. Just enter your card details at checkout.",
                "Pay with any credit or debit card. We use encrypted payment processing.",
                "Card payment option available. Enter number, expiry, CVV, and name securely.",
                "All major cards accepted. Your payment info is encrypted and safe."
            ],
            
            'paypal_payment': [
                "PayPal is accepted! You'll be redirected to PayPal to complete payment securely.",
                "Choose PayPal at checkout for fast payment using your PayPal account.",
                "PayPal option available. Quick and secure - no need to enter card details.",
                "Yes, we accept PayPal! Click the PayPal option during payment.",
                "PayPal users can pay directly. Just select PayPal as your method."
            ],
            
            'google_pay': [
                "Google Pay accepted! Use it for fast checkout if you have it set up.",
                "Pay with Google Pay - quick and easy on Android devices.",
                "Google Pay integration available. One-tap payment if you're set up.",
                "Yes, Google Pay works! Select it at checkout for seamless payment.",
                "Google Pay is supported. Fast payment without typing card details."
            ],
            
            'apple_pay': [
                "Apple Pay accepted on iOS devices! Use Touch ID or Face ID to pay.",
                "iPhone users can pay with Apple Pay. Fast and secure with biometrics.",
                "Apple Pay integration works seamlessly on Safari browser.",
                "Yes, Apple Pay is supported. Just authenticate with Face/Touch ID.",
                "Apple Pay option available for iOS users. Simple and secure."
            ],
            
            // ===== SECURITY QUESTIONS =====
            'cctv': [
                "We have 24/7 CCTV surveillance across all parking floors. Your vehicle is monitored.",
                "Security cameras cover every corner of the parking facility. Recorded 24/7.",
                "Full CCTV coverage throughout the parking area. Your safety is our priority.",
                "Cameras are installed on all floors and at entrances/exits. Continuous recording.",
                "24/7 video surveillance ensures your vehicle is always monitored."
            ],
            
            'security_guards': [
                "Security guards patrol the facility regularly. They're trained and professional.",
                "On-site security personnel present 24/7. They can assist in emergencies.",
                "Trained security guards conduct regular patrols throughout the day and night.",
                "Security staff always on duty. Contact them via emergency buttons if needed.",
                "Physical security guards complement our camera system. Double protection!"
            ],
            
            'emergency_contact': [
                "Emergency contact: +919301750723. Available 24/7 for urgent situations.",
                "For emergencies, call security immediately: +919301750723.",
                "24/7 emergency line: +919301750723. Save it in your phone just in case.",
                "In case of emergency, dial +919301750723. Security responds quickly.",
                "Emergency assistance: +919301750723. Available around the clock."
            ],
            
            // ===== ACCOUNT QUESTIONS =====
            'create_account': [
                "Creating account is free and takes less than a minute! Click 'Account' then 'Sign Up'.",
                "Sign up easily with email or Google/Facebook. Save vehicles for faster booking.",
                "Account creation: Just fill name, email, password. That's it!",
                "Register in seconds. You'll get dashboard access and booking history.",
                "Create account to manage bookings, save vehicles, and get receipts."
            ],
            
            'forgot_password': [
                "Forgot password? Click 'Forgot Password' on login page. Reset link sent to email.",
                "No worries! Use 'Forgot Password' option. We'll email you reset instructions.",
                "Password reset: Enter your email, we'll send a link to create new password.",
                "Can't remember password? Click forgot password link and follow email instructions.",
                "Reset your password easily via email. Takes just 2 minutes."
            ],
            
            'dashboard_features': [
                "Dashboard shows: Active bookings, past bookings, payment history, receipts, and settings.",
                "From dashboard you can: View bookings, extend time, cancel, download receipts.",
                "Your dashboard: Overview stats, booking management, payment records, profile settings.",
                "Dashboard gives you full control: Manage all your bookings in one place.",
                "Access dashboard to see loyalty points, total spent, and upcoming reservations."
            ],
            
            // ===== RECEIPTS =====
            'get_receipt': [
                "Receipts available in Dashboard > Payments. Download as PDF or print.",
                "Find all receipts under Payments section in your Dashboard. Email copy also sent.",
                "Every booking generates receipt. Check your email or Dashboard > Payments.",
                "Download receipts anytime from payment history in your Dashboard.",
                "Receipts stored securely. Access them from Dashboard > Payments tab."
            ],
            
            'email_receipt': [
                "Yes! Receipt is automatically emailed to you after each successful booking.",
                "Check your inbox - receipt sent instantly to your registered email address.",
                "Email receipt arrives within minutes of payment confirmation.",
                "We send receipt to your email. Also available in Dashboard if you miss it.",
                "Automatic email receipt with every booking. Check spam folder if not received."
            ],
            
            // ===== EXTEND BOOKING =====
            'how_to_extend': [
                "To extend: Dashboard > My Bookings > Find active booking > Click 'Extend'.",
                "Extend time easily from your Dashboard. Choose additional hours and pay.",
                "Go to Bookings in Dashboard, click Extend on any active booking, select hours.",
                "Extension feature in Dashboard. Add time to current booking if slot available.",
                "Extend booking: Active bookings show 'Extend' button. Click and choose duration."
            ],
            
            'extend_cost': [
                "Extension costs same hourly rate plus tax. You only pay for additional hours.",
                "Price for extension = hourly rate × extra hours + tax. No extra fees!",
                "You pay just the regular rate for extended time. Same as original booking price.",
                "Extension cost calculated based on your slot's hourly rate. Pro-rated.",
                "Pay only for added hours at same rate. No service fee for extensions."
            ],
            
            'extend_limit': [
                "You can extend up to 24 hours before original end time, subject to availability.",
                "Extension allowed until 24 hours before booking ends. After that, no changes.",
                "Maximum extension: 24 hours added. Depends on slot availability though.",
                "Extend anytime until 24 hours before your current end time.",
                "Extension window closes 24 hours before end. Plan ahead!"
            ],
            
            // ===== ACCESSIBILITY =====
            'handicap_spots': [
                "Handicap spots on ground floor near entrance. Marked with ♿ symbol.",
                "Reserved handicap parking: 10 spots on ground floor, closest to entrance.",
                "Accessible parking available at all entrances. Wide spaces for easy access.",
                "Handicap spots wider than regular, located near elevators and exits.",
                "♿ Designated spots on every floor near elevators. Ground floor has most."
            ],
            
            'wheelchair_access': [
                "Full wheelchair accessibility throughout. Ramps, wide paths, and elevators.",
                "All floors accessible via elevator. Wide aisles for wheelchair maneuverability.",
                "Wheelchair-friendly paths from entrance to all parking spots.",
                "Accessible routes clearly marked. Elevators have braille buttons too.",
                "No steps anywhere. Smooth access for wheelchair users to all areas."
            ],
            
            'assistance_available': [
                "Need assistance? Security can help. Call +919301750723 for immediate help.",
                "Staff available to assist with accessibility needs. Just ask at entrance.",
                "Request assistance via emergency intercoms located throughout parking.",
                "Special assistance available. Contact security or office during hours.",
                "We're happy to help! Call support for any accessibility accommodation."
            ],
            
            // ===== LOST VEHICLE =====
            'find_car': [
                "Check your booking confirmation for slot number. Then use map to locate.",
                "Look in Dashboard > Bookings for your slot ID. Find it on floor map.",
                "Lost your car? Check receipt for floor and slot number. Maps show exact location.",
                "Your booking has slot number. Open Live Parking, select floor, find your slot.",
                "Every booking shows exact parking spot. Use map to navigate there."
            ],
            
            'forgot_slot': [
                "If you forgot slot number, check email receipt or Dashboard bookings.",
                "Slot number in confirmation email and Dashboard. Can't miss it!",
                "Forgot where you parked? Login to Dashboard, view active booking for slot.",
                "All bookings show slot ID. Access via Dashboard > My Bookings.",
                "Slot information always available in your booking history and receipts."
            ],
            
            // ===== PROMO CODES =====
            'apply_promo': [
                "Enter promo code during payment in the 'Promo Code' field before confirming.",
                "Promo codes can be applied at checkout. Case sensitive - enter exactly as given.",
                "Look for 'Have a promo code?' link during payment. Click and enter code.",
                "Apply discount codes in the payment step. Discount shown before final amount.",
                "Promo code field appears when you select payment method. Enter there."
            ],
            
            'current_promos': [
                "Current promos: EV 15% off, Early bird $15 all day, Weekend $12 flat.",
                "Check Home page banner for active promotions. New offers added regularly.",
                "Follow us on social media for exclusive promo codes and deals!",
                "Special offers: Student discount available? Contact support to check.",
                "Seasonal promotions running. Check website or app for latest deals."
            ],
            
            // ===== CONTACT & OFFICE =====
            'office_address': [
                "Main office: 02 Ashok Colony Parking St, Gwalior, Madhya Pradesh, India.",
                "Visit us at Ashok Colony, Gwalior - MP 474001. Open 8AM-8PM daily.",
                "Physical address: 02 Ashok Colony Parking Street, Gwalior, India.",
                "Our office is located in Ashok Colony, Gwalior. Map available in footer.",
                "Come see us: Ashok Colony, Gwalior, Madhya Pradesh. Office hours 8AM-8PM."
            ],
            
            'office_hours': [
                "Office open 8AM to 8PM every day. Support available 24/7 by phone.",
                "Physical office hours: 8AM-8PM daily. Chat available 9AM-9PM.",
                "Visit office between 8AM-8PM for in-person help. After hours? Call support.",
                "Office: 8AM-8PM all days. Parking support available beyond these hours via phone.",
                "Walk-in assistance 8AM-8PM. Outside these hours, use chat or call."
            ],
            
            'phone_support': [
                "24/7 phone support: +91 9575228807. Call anytime for immediate help.",
                "Emergency line: +91 9575228807. Regular support: +91 9575228807.",
                "Speak to human agent: +91 9575228807. Available round the clock.",
                "Need to talk? Call +91 9575228807. Support team ready to assist.",
                "Phone assistance 24/7. Dial +91 9575228807 for any parking issues."
            ],
            
            'email_support': [
                "Email support: himanshugoud638@gmail.com. Response within 2 hours.",
                "Send your queries to himanshugoud638@gmail.com. We reply quickly!",
                "For non-urgent issues, email himanshugoud638@gmail.com. 2 hour response time.",
                "Email us at himanshugoud638@gmail.com. Include booking ID for faster help.",
                "Support inbox: himanshugoud638@gmail.com. We aim to reply within 2 hours."
            ],
            
            // ===== DEFAULT RESPONSES (8 variations) =====
            'default': [
                "I'm not sure about that. Try asking about: booking, pricing, availability, EV, or support.",
                "Can you rephrase? I'm best with parking questions like how to book, pricing, or availability.",
                "Hmm, I don't have info on that. Ask me about parking spots, rates, cancellations, or EV charging.",
                "I specialize in parking help. Try questions like 'How to book?' 'Available spots?' or 'Support number?'",
                "Not sure I understand. I can help with: booking process, pricing, cancellations, and security.",
                "Let's try parking-related questions. Ask about floor availability, payment methods, or office hours.",
                "I'm here for parking assistance. Questions about bookings, receipts, extensions - I can help!",
                "That's outside my knowledge. I know everything about SmartPark - bookings, pricing, EV, support."
            ]
        };
        
        // ========================
        // EXPANDED KEYWORDS MAPPING
        // More specific keywords for better matching
        // ========================
        this.keywordMap = {
            // Availability
            'available_now': [
                'available now', 'spots available', 'free spots', 'any spots', 
                'how many spots', 'vacant', 'empty spots'
            ],
            'ground_floor': [
                'ground floor', 'ground level', 'floor ground'
            ],
            'first_floor': [
                'first floor', 'floor 1', 'level 1'
            ],
            'second_floor': [
                'second floor', 'floor 2', 'level 2', 'top floor'
            ],
            
            // Booking steps
            'how_to_book_step1': [
                'first step booking', 'step 1 booking', 'start booking'
            ],
            'how_to_book_step2': [
                'second step booking', 'step 2 booking', 'select slot'
            ],
            'how_to_book_step3': [
                'third step booking', 'step 3 booking', 'book button'
            ],
            'how_to_book_step4': [
                'fourth step booking', 'step 4 booking', 'final step'
            ],
            
            // Pricing variations
            'standard_price': [
                'standard price', 'regular rate', 'normal price', 'standard rate'
            ],
            'premium_price': [
                'premium price', 'premium rate', 'premium cost'
            ],
            'ev_price': [
                'ev price', 'electric rate', 'ev cost'
            ],
            'night_rate': [
                'night rate', 'night price', 'after 8pm', 'overnight rate'
            ],
            'weekend_rate': [
                'weekend rate', 'saturday price', 'sunday price'
            ],
            'early_bird': [
                'early bird', 'before 8am', 'morning rate'
            ],
            
            // EV variations
            'ev_locations': [
                'where ev', 'ev location', 'ev spots location', 'find ev'
            ],
            'ev_charging_time': [
                'charging time', 'how long charge', 'charge duration'
            ],
            'ev_discount': [
                'ev discount', 'electric discount', 'ev off'
            ],
            
            // Cancel variations
            'how_to_cancel': [
                'how to cancel', 'cancel booking', 'cancel reservation'
            ],
            'cancel_policy': [
                'cancel policy', 'cancellation policy', 'cancel rules'
            ],
            'cancel_deadline': [
                'cancel deadline', 'cancel until', 'last cancel'
            ],
            'cancel_online': [
                'cancel online', 'cancel website', 'cancel myself'
            ],
            'cancel_refund': [
                'cancel refund', 'refund after cancel', 'get money back cancel'
            ],
            
            // Payment variations
            'card_payment': [
                'credit card', 'debit card', 'card payment', 'visa', 'mastercard'
            ],
            'paypal_payment': [
                'paypal', 'pay pal'
            ],
            'google_pay': [
                'google pay', 'gpay'
            ],
            'apple_pay': [
                'apple pay', 'iphone pay'
            ],
            
            // Security variations
            'cctv': [
                'cctv', 'camera', 'surveillance', 'monitored'
            ],
            'security_guards': [
                'security guard', 'guard patrol', 'security personnel'
            ],
            'emergency_contact': [
                'emergency contact', 'emergency number', 'urgent'
            ],
            
            // Account variations
            'create_account': [
                'create account', 'sign up', 'register', 'new account'
            ],
            'forgot_password': [
                'forgot password', 'reset password', 'lost password'
            ],
            'dashboard_features': [
                'dashboard features', 'what dashboard', 'dashboard help'
            ],
            
            // Receipt variations
            'get_receipt': [
                'get receipt', 'download receipt', 'print receipt'
            ],
            'email_receipt': [
                'email receipt', 'receipt email', 'send receipt'
            ],
            
            // Extend variations
            'how_to_extend': [
                'how to extend', 'extend booking', 'add time'
            ],
            'extend_cost': [
                'extend cost', 'extension price', 'extend fee'
            ],
            'extend_limit': [
                'extend limit', 'how long extend', 'max extension'
            ],
            
            // Accessibility variations
            'handicap_spots': [
                'handicap', 'disabled', 'handicapped'
            ],
            'wheelchair_access': [
                'wheelchair', 'accessible', 'mobility'
            ],
            'assistance_available': [
                'assistance', 'help available', 'need help'
            ],
            
            // Lost vehicle
            'find_car': [
                'find my car', 'find vehicle', 'locate car'
            ],
            'forgot_slot': [
                'forgot slot', 'remember slot', 'what slot'
            ],
            
            // Promo
            'apply_promo': [
                'apply promo', 'use promo', 'enter promo'
            ],
            'current_promos': [
                'current promo', 'active promo', 'any promo'
            ],
            
            // Contact
            'office_address': [
                'office address', 'where office', 'location office'
            ],
            'office_hours': [
                'office hours', 'office timings', 'when office open'
            ],
            'phone_support': [
                'phone number', 'call support', 'phone support'
            ],
            'email_support': [
                'email address', 'email support', 'send email'
            ],
            
            // Founder variations
            'who_is_founder': [
                'who founder', 'who created', 'who built', 'who made'
            ],
            'contact_founder': [
                'contact founder', 'reach founder', 'founder email'
            ],
            'about_founder': [
                'about founder', 'founder details', 'founder info'
            ],
            'founder_story': [
                'founder story', 'how started', 'beginning'
            ],
            
            // Casual variations
            'how_are_you': [
                'how are you', 'how do you do'
            ],
            'nice_to_meet_you': [
                'nice to meet', 'pleased to meet', 'good to meet'
            ],
            'how_are_you_doing': [
                'how you doing', 'how are things'
            ],
            'whats_up': [
                'whats up', 'what\'s up', 'sup'
            ],
            'good_morning': [
                'good morning', 'gm'
            ],
            'good_afternoon': [
                'good afternoon', 'afternoon'
            ],
            'good_evening': [
                'good evening', 'evening'
            ]
        };
        
        // Quick actions (showing variety)
        this.quickActions = [
            { text: "Available spots?", type: "available_now" },
            { text: "How to book?", type: "how_to_book_step1" },
            { text: "Standard price?", type: "standard_price" },
            { text: "EV charging?", type: "ev_locations" },
            { text: "How to cancel?", type: "how_to_cancel" },
            { text: "Support number", type: "phone_support" },
            { text: "Payment methods", type: "card_payment" },
            { text: "Who is founder?", type: "who_is_founder" },
            { text: "Nice to meet you", type: "nice_to_meet_you" },
            { text: "How are you?", type: "how_are_you" },
            { text: "Office hours", type: "office_hours" },
            { text: "Get receipt", type: "get_receipt" }
        ];
        
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.loadHistory();
        this.createAudioElements();
        this.createChatWidget();
        this.setupEventListeners();
        this.setupProactiveHelp();
        this.updateUnreadCount();
        
        console.log('Live Chat System initialized with unique responses for every question');
    }
    
    createAudioElements() {
        // Use external sound files for better compatibility
        const soundBasePath = 'sounds/'; // Update this path as needed
        
        // Message sent sound
        this.audioElements.messageSent = new Audio();
        this.audioElements.messageSent.src = soundBasePath + 'send.mp3';
        this.audioElements.messageSent.volume = 0.3;
        this.audioElements.messageSent.preload = 'auto';
        
        // Message received sound
        this.audioElements.messageReceived = new Audio();
        this.audioElements.messageReceived.src = soundBasePath + 'receive.mp3';
        this.audioElements.messageReceived.volume = 0.3;
        this.audioElements.messageReceived.preload = 'auto';
        
        // Notification sound
        this.audioElements.notification = new Audio();
        this.audioElements.notification.src = soundBasePath + 'notification.mp3';
        this.audioElements.notification.volume = 0.4;
        this.audioElements.notification.preload = 'auto';
        
        // Preload audio
        this.setupAudioPreload();
    }
    
    createSentSound() {
        // Base64 encoded short beep sound
        return "data:audio/wav;base64,UklGRnoAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
    }
    
    createReceivedSound() {
        // Base64 encoded different beep sound
        return "data:audio/wav;base64,UklGRoAAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
    }
    
    createNotificationSound() {
        // Base64 encoded two-tone notification
        return "data:audio/wav;base64,UklGRqAAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
    }
    
    setupAudioPreload() {
        // Try to preload audio by playing a silent sound on first user interaction
        const preloadAudio = () => {
            if (this.audioInitialized) return;
            
            try {
                // Play and immediately pause to preload
                const silentAudio = new Audio();
                silentAudio.src = "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBIAAAABAAEARKwAAABCAAABAAgAZGF0YQAAAAA=";
                silentAudio.volume = 0;
                silentAudio.play().then(() => {
                    silentAudio.pause();
                    this.audioInitialized = true;
                    console.log('Audio preloaded successfully');
                }).catch(e => {
                    console.log('Audio preload failed:', e);
                });
            } catch (e) {
                console.log('Audio setup error:', e);
            }
            
            // Remove event listeners after first try
            document.removeEventListener('click', preloadAudio);
            document.removeEventListener('keydown', preloadAudio);
            document.removeEventListener('touchstart', preloadAudio);
        };
        
        // Add event listeners for user interaction
        document.addEventListener('click', preloadAudio, { once: true });
        document.addEventListener('keydown', preloadAudio, { once: true });
        document.addEventListener('touchstart', preloadAudio, { once: true });
    }
    
    playSound(soundType) {
        if (!this.settings.sounds) return;
        
        try {
            const audio = this.audioElements[soundType];
            if (!audio) return;
            
            // Clone the audio element to allow overlapping sounds
            const audioClone = audio.cloneNode();
            audioClone.volume = audio.volume;
            
            // Play the cloned audio
            audioClone.play().catch(e => {
                // If play fails, try with a user gesture workaround
                console.log('Audio play failed, trying workaround:', e);
                this.playSoundWithWorkaround(soundType);
            });
            
            // Clean up after playing
            audioClone.onended = () => {
                audioClone.remove();
            };
        } catch (e) {
            console.log('Sound playback error:', e);
        }
    }
    
    playSoundWithWorkaround(soundType) {
        // Alternative method using HTML5 audio with user gesture
        if (!this.settings.sounds) return;
        
        try {
            // Create new audio element
            const audio = new Audio();
            
            // Set the appropriate sound
            switch(soundType) {
                case 'messageSent':
                    audio.src = this.createSentSound();
                    audio.volume = 0.3;
                    break;
                case 'messageReceived':
                    audio.src = this.createReceivedSound();
                    audio.volume = 0.3;
                    break;
                case 'notification':
                    audio.src = this.createNotificationSound();
                    audio.volume = 0.4;
                    break;
            }
            
            // Try to play
            audio.play().catch(e => {
                console.log('Workaround also failed:', e);
            });
        } catch (e) {
            console.log('Workaround error:', e);
        }
    }
    
    createChatWidget() {
        // Create main chat container
        const chatContainer = document.createElement('div');
        chatContainer.className = 'chat-container';
        chatContainer.id = 'chat-container';
        chatContainer.innerHTML = `
            <!-- Chat Header -->
            <div class="chat-header">
                <div class="chat-header-info">
                    <div class="chat-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div>
                        <h3 class="chat-title">${this.config.botName}</h3>
                        <p class="chat-subtitle">${this.config.botSubtitle}</p>
                        <div class="chat-status">
                            <span class="status-dot"></span>
                            <span>Online</span>
                        </div>
                    </div>
                </div>
                <div class="chat-controls">
                    <button class="chat-control-btn" id="chat-history-btn" title="Chat History">
                        <i class="fas fa-history"></i>
                    </button>
                    <button class="chat-control-btn" id="chat-settings-btn" title="Settings">
                        <i class="fas fa-cog"></i>
                    </button>
                    <button class="chat-control-btn" id="chat-minimize-btn" title="Minimize">
                        <i class="fas fa-minus"></i>
                    </button>
                </div>
            </div>
            
            <!-- Chat Body -->
            <div class="chat-body" id="chat-body">
                <!-- Welcome message will be added here -->
            </div>
            
            <!-- Chat Footer -->
            <div class="chat-footer">
                <div class="chat-input-container">
                    <div class="chat-input-wrapper">
                        <textarea 
                            class="chat-input" 
                            id="chat-input" 
                            placeholder="Type your message here..."
                            rows="1"
                        ></textarea>
                    </div>
                    <button class="send-btn" id="send-btn" disabled>
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
            
            <!-- Chat History Panel -->
            <div class="chat-history-panel" id="chat-history-panel">
                <div class="history-header">
                    <h3><i class="fas fa-history"></i> Chat History</h3>
                    <button class="chat-control-btn" id="close-history-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="history-content" id="history-content">
                    <!-- History will be loaded here -->
                </div>
            </div>
            
            <!-- Chat Settings Panel -->
            <div class="chat-settings-panel" id="chat-settings-panel">
                <div class="history-header">
                    <h3><i class="fas fa-cog"></i> Chat Settings</h3>
                    <button class="chat-control-btn" id="close-settings-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="settings-content" id="settings-content">
                    <!-- Settings will be loaded here -->
                </div>
            </div>
        `;
        
        // Create toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'chat-toggle-btn';
        toggleBtn.id = 'chat-toggle-btn';
        toggleBtn.innerHTML = '<i class="fas fa-comment"></i>';
        
        // Create badge for unread messages
        const badge = document.createElement('div');
        badge.className = 'chat-badge';
        badge.id = 'chat-badge';
        badge.style.display = 'none';
        badge.textContent = '0';
        
        toggleBtn.appendChild(badge);
        
        // Create widget container
        const widget = document.createElement('div');
        widget.className = 'chat-widget';
        widget.appendChild(toggleBtn);
        widget.appendChild(chatContainer);
        
        // Add proactive notification
        const proactiveNotification = document.createElement('div');
        proactiveNotification.className = 'chat-proactive-notification';
        proactiveNotification.id = 'chat-proactive-notification';
        proactiveNotification.innerHTML = `
            <div class="proactive-content">
                <h4 class="proactive-title">Need help with parking?</h4>
                <p class="proactive-message">Parky is here to help you find spots, book, and answer questions!</p>
            </div>
            <div class="proactive-actions">
                <button class="proactive-btn accept" id="proactive-accept">Chat Now</button>
                <button class="proactive-btn dismiss" id="proactive-dismiss">Not Now</button>
            </div>
        `;
        
        widget.appendChild(proactiveNotification);
        
        document.body.appendChild(widget);
        
        // Initialize current session
        this.currentSession = {
            id: this.generateSessionId(),
            date: new Date().toISOString(),
            messages: []
        };
        
        // Add welcome message
        this.addWelcomeMessage();
    }
    
    setupEventListeners() {
        // Toggle chat
        document.getElementById('chat-toggle-btn').addEventListener('click', () => {
            this.toggleChat();
        });
        
        // Minimize chat
        document.getElementById('chat-minimize-btn').addEventListener('click', () => {
            this.toggleChat();
        });
        
        // History button
        document.getElementById('chat-history-btn').addEventListener('click', () => {
            this.showHistoryPanel();
        });
        
        // Close history
        document.getElementById('close-history-btn').addEventListener('click', () => {
            this.hideHistoryPanel();
        });
        
        // Settings button
        document.getElementById('chat-settings-btn').addEventListener('click', () => {
            this.showSettingsPanel();
        });
        
        // Close settings
        document.getElementById('close-settings-btn').addEventListener('click', () => {
            this.hideSettingsPanel();
        });
        
        // Chat input
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');
        
        chatInput.addEventListener('input', () => {
            this.adjustTextareaHeight(chatInput);
            sendBtn.disabled = chatInput.value.trim() === '';
        });
        
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!sendBtn.disabled) {
                    this.sendMessage();
                }
            }
        });
        
        // Send button
        sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Quick action buttons (will be added dynamically)
        document.getElementById('chat-body').addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-action-btn')) {
                const actionType = e.target.dataset.type;
                this.handleQuickAction(actionType);
            }
        });
        
        // Proactive notification
        document.getElementById('proactive-accept').addEventListener('click', () => {
            this.hideProactiveNotification();
            this.openChat();
        });
        
        document.getElementById('proactive-dismiss').addEventListener('click', () => {
            this.hideProactiveNotification();
            // Don't show again for this session
            this.settings.showProactive = false;
            this.saveSettings();
        });
        
        // Close chat when clicking outside (on mobile)
        document.addEventListener('click', (e) => {
            const chatContainer = document.getElementById('chat-container');
            const toggleBtn = document.getElementById('chat-toggle-btn');
            
            if (this.isOpen && 
                !chatContainer.contains(e.target) && 
                !toggleBtn.contains(e.target) &&
                window.innerWidth <= 768) {
                this.toggleChat();
            }
        });
        
        // Escape key to close panels
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (document.getElementById('chat-history-panel').classList.contains('active')) {
                    this.hideHistoryPanel();
                } else if (document.getElementById('chat-settings-panel').classList.contains('active')) {
                    this.hideSettingsPanel();
                } else if (this.isOpen) {
                    this.toggleChat();
                }
            }
        });
        
        // Auto-resize textarea on window resize
        window.addEventListener('resize', () => {
            this.adjustTextareaHeight(chatInput);
        });
    }
    
    setupProactiveHelp() {
        if (!this.settings.showProactive) return;
        
        // Show proactive notification after delay
        this.proactiveTimer = setTimeout(() => {
            this.showProactiveNotification();
        }, this.config.proactiveDelay);
        
        // Also show based on user behavior
        this.setupBehaviorTracking();
    }
    
    setupBehaviorTracking() {
        // Track time on page
        let timeOnPage = 0;
        const timeInterval = setInterval(() => {
            timeOnPage += 1000;
            
            // Show proactive help after 60 seconds if user hasn't opened chat
            if (timeOnPage >= 60000 && !this.hasInteractedWithChat() && this.settings.showProactive) {
                this.showProactiveNotification();
                clearInterval(timeInterval);
            }
        }, 1000);
        
        // Track parking page visits
        const parkingLinks = document.querySelectorAll('a[href="#parking"], #action-find-parking-horizontal');
        parkingLinks.forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(() => {
                    if (this.settings.showProactive && !this.hasInteractedWithChat()) {
                        this.showProactiveNotification();
                    }
                }, 2000);
            });
        });
    }
    
    hasInteractedWithChat() {
        return this.currentSession.messages.length > 0 || this.isOpen;
    }
    
    toggleChat() {
        this.isOpen = !this.isOpen;
        const chatContainer = document.getElementById('chat-container');
        const toggleBtn = document.getElementById('chat-toggle-btn');
        
        if (this.isOpen) {
            chatContainer.classList.add('active');
            toggleBtn.classList.add('active');
            document.getElementById('chat-input').focus();
            
            // Mark messages as read when opening
            this.markAsRead();
            
            // Hide proactive notification if visible
            this.hideProactiveNotification();
            
            // Auto-scroll to bottom
            setTimeout(() => {
                this.scrollToBottom();
            }, 100);
        } else {
            chatContainer.classList.remove('active');
            toggleBtn.classList.remove('active');
            this.hideHistoryPanel();
            this.hideSettingsPanel();
        }
    }
    
    openChat() {
        if (!this.isOpen) {
            this.toggleChat();
        }
    }
    
    sendMessage() {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();
        
        if (!message) return;
        
        // Play send sound
        this.playSound('messageSent');
        
        // Add user message
        this.addMessage(message, 'user');
        
        // Clear input
        chatInput.value = '';
        chatInput.style.height = 'auto';
        document.getElementById('send-btn').disabled = true;
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Process message and generate bot response
        setTimeout(() => {
            this.processUserMessage(message);
        }, this.config.typingDelay);
    }
    
    determineResponseType(message) {
        const lowerMsg = message.toLowerCase().trim();
        
        // ===== GREETING DETECTION =====
        if (lowerMsg.match(/^(hi|hello|hey|hola|namaste)$/i)) {
            return 'greeting';
        }
        
        // ===== CASUAL CONVERSATION DETECTION =====
        if (lowerMsg.includes('how are you') && !lowerMsg.includes('how are you doing')) {
            return 'how_are_you';
        }
        if (lowerMsg.includes('nice to meet you') || lowerMsg.includes('pleased to meet you')) {
            return 'nice_to_meet_you';
        }
        if (lowerMsg.includes('how are you doing') || lowerMsg.includes('how you doing')) {
            return 'how_are_you_doing';
        }
        if (lowerMsg.includes('whats up') || lowerMsg.includes('what\'s up') || lowerMsg === 'sup') {
            return 'whats_up';
        }
        if (lowerMsg.includes('good morning') || lowerMsg === 'gm') {
            return 'good_morning';
        }
        if (lowerMsg.includes('good afternoon')) {
            return 'good_afternoon';
        }
        if (lowerMsg.includes('good evening')) {
            return 'good_evening';
        }
        
        // ===== FOUNDER DETECTION =====
        if (lowerMsg.includes('who is the founder') || 
            (lowerMsg.includes('who') && lowerMsg.includes('founder'))) {
            return 'who_is_founder';
        }
        if (lowerMsg.includes('contact founder') || 
            (lowerMsg.includes('reach') && lowerMsg.includes('founder')) ||
            (lowerMsg.includes('founder') && lowerMsg.includes('email'))) {
            return 'contact_founder';
        }
        if (lowerMsg.includes('about founder') || 
            (lowerMsg.includes('tell me') && lowerMsg.includes('founder'))) {
            return 'about_founder';
        }
        if (lowerMsg.includes('founder story') || 
            lowerMsg.includes('how started') || 
            lowerMsg.includes('beginning of smartpark')) {
            return 'founder_story';
        }
        
        // ===== CANCELLATION DETECTION =====
        if (lowerMsg.includes('how to cancel') || lowerMsg.includes('cancel my booking')) {
            return 'how_to_cancel';
        }
        if (lowerMsg.includes('cancel policy') || lowerMsg.includes('cancellation policy')) {
            return 'cancel_policy';
        }
        if (lowerMsg.includes('cancel deadline') || lowerMsg.includes('how long to cancel')) {
            return 'cancel_deadline';
        }
        if (lowerMsg.includes('cancel online') || lowerMsg.includes('cancel myself')) {
            return 'cancel_online';
        }
        if (lowerMsg.includes('cancel refund') || lowerMsg.includes('refund after cancel')) {
            return 'cancel_refund';
        }
        
        // ===== PRICING DETECTION =====
        if (lowerMsg.includes('standard price') || lowerMsg.includes('regular rate')) {
            return 'standard_price';
        }
        if (lowerMsg.includes('premium price') || lowerMsg.includes('premium rate')) {
            return 'premium_price';
        }
        if (lowerMsg.includes('ev price') || lowerMsg.includes('electric rate')) {
            return 'ev_price';
        }
        if (lowerMsg.includes('night rate') || lowerMsg.includes('after 8pm') || lowerMsg.includes('overnight')) {
            return 'night_rate';
        }
        if (lowerMsg.includes('weekend rate') || lowerMsg.includes('saturday') || lowerMsg.includes('sunday')) {
            return 'weekend_rate';
        }
        if (lowerMsg.includes('early bird') || lowerMsg.includes('before 8am')) {
            return 'early_bird';
        }
        
        // ===== GENERAL KEYWORD MAPPING =====
        for (const [type, keywords] of Object.entries(this.keywordMap)) {
            for (const keyword of keywords) {
                if (lowerMsg.includes(keyword)) {
                    return type;
            }
        }
    }
        
        // ===== FALLBACK TO DEFAULT =====
        return 'default';
    }
    
    processUserMessage(message) {
        // Remove typing indicator
        this.removeTypingIndicator();
        
        // Determine response type based on message content
        let responseType = this.determineResponseType(message.toLowerCase());
        
        // Get bot response
        const responses = this.botResponses[responseType] || this.botResponses.default;
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        // Replace placeholders for availability
        let finalResponse = randomResponse;
        if (responseType === 'available_now') {
            const availableSlots = document.getElementById('quick-available-slots')?.textContent || '85';
            finalResponse = randomResponse.replace('{count}', availableSlots);
        }
        
        // Add bot response
        this.addMessage(finalResponse, 'bot', responseType);
        
        // Play received sound
        setTimeout(() => {
            this.playSound('messageReceived');
        }, 100);
        
        // Save to history
        this.saveMessageToHistory(message, 'user');
        this.saveMessageToHistory(finalResponse, 'bot', responseType);
        
        // Show follow-up suggestions for certain responses
        setTimeout(() => {
            this.showFollowUpSuggestions(responseType);
        }, 1000);
        
        // Auto-scroll
        this.scrollToBottom();
    }
    
    showFollowUpSuggestions(lastResponseType) {
        const chatBody = document.getElementById('chat-body');
        
        // Remove existing suggestions
        const existingSuggestions = chatBody.querySelector('.follow-up-suggestions');
        if (existingSuggestions) {
            existingSuggestions.remove();
        }
        
        // Define follow-up questions based on last response
        let followUps = [];
        
        switch(lastResponseType) {
            case 'available_now':
                followUps = [
                    "Book now?",
                    "Ground floor spots?",
                    "EV spots?"
                ];
                break;
            case 'how_to_cancel':
                followUps = [
                    "Refund amount?",
                    "Cancel deadline?",
                    "Need help?"
                ];
                break;
            case 'who_is_founder':
                followUps = [
                    "Contact founder?",
                    "Founder story?",
                    "More about SmartPark?"
                ];
                break;
            case 'standard_price':
            case 'premium_price':
            case 'ev_price':
                followUps = [
                    "Night rates?",
                    "Weekend deals?",
                    "Discounts?"
                ];
                break;
            case 'how_are_you':
            case 'nice_to_meet_you':
                followUps = [
                    "Available spots?",
                    "How to book?",
                    "Pricing?"
                ];
                break;
            default:
                // Don't show follow-ups for default
                return;
        }
        
        if (followUps.length === 0) return;
        
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.className = 'follow-up-suggestions';
        suggestionsDiv.style.cssText = `
            margin-top: 0.5rem;
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        `;
        
        followUps.forEach(question => {
            const btn = document.createElement('button');
            btn.className = 'quick-action-btn';
            btn.textContent = question;
            btn.style.cssText = `
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                padding: 0.5rem 0.75rem;
                border-radius: var(--radius);
                font-size: 0.75rem;
                cursor: pointer;
                transition: all 0.2s;
            `;
            
            btn.addEventListener('click', () => {
                btn.remove();
                this.addMessage(question, 'user');
                this.showTypingIndicator();
                
                setTimeout(() => {
                    this.removeTypingIndicator();
                    // Find appropriate response type for follow-up
                    const followUpType = this.determineResponseType(question);
                    const responses = this.botResponses[followUpType] || this.botResponses.default;
                    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                    this.addMessage(randomResponse, 'bot', followUpType);
                }, this.config.typingDelay);
            });
            
            suggestionsDiv.appendChild(btn);
        });
        
        chatBody.appendChild(suggestionsDiv);
        this.scrollToBottom();
    }
    
    handleQuickAction(actionType) {
        // Find the quick action
        const action = this.quickActions.find(a => a.type === actionType);
        if (action) {
            // Play send sound
            this.playSound('messageSent');
            
            this.addMessage(action.text, 'user');
            this.showTypingIndicator();
            
            setTimeout(() => {
                this.removeTypingIndicator();
                const responses = this.botResponses[actionType] || this.botResponses.default;
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                this.addMessage(randomResponse, 'bot', actionType);
            }, this.config.typingDelay);
        }
    }
    
    addMessage(text, sender, type = null) {
        const chatBody = document.getElementById('chat-body');
        const messageId = Date.now();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.dataset.id = messageId;
        messageDiv.dataset.type = type;
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-content">${this.formatMessage(text)}</div>
            <div class="message-time">${time}</div>
        `;
        
        chatBody.appendChild(messageDiv);
        
        // Add to current session
        this.currentSession.messages.push({
            id: messageId,
            text,
            sender,
            type,
            time: new Date().toISOString()
        });
        
        // Auto-scroll
        this.scrollToBottom();
        
        // Update unread count if chat is closed
        if (sender === 'bot' && !this.isOpen) {
            this.incrementUnreadCount();
        }
        
        return messageId;
    }
    
    addWelcomeMessage() {
        const chatBody = document.getElementById('chat-body');
        
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'welcome-message';
        welcomeDiv.innerHTML = `
            <h4>${this.config.botName} - SmartPark Assistant</h4>
            <p>Online • I can help with parking questions</p>
            <p>Ask me about availability, booking, pricing, EV, support, founder & more!</p>
        `;
        
        chatBody.appendChild(welcomeDiv);
        
        // Add initial bot message
        setTimeout(() => {
            this.addMessage("Hi! I'm Parky. Need help with parking? Ask me anything!", 'bot', 'greeting');
            this.showQuickActions();
        }, 500);
    }
    
    showQuickActions() {
        const chatBody = document.getElementById('chat-body');
        
        // Remove existing quick actions
        const existingActions = chatBody.querySelector('.quick-actions-container');
        if (existingActions) {
            existingActions.remove();
        }
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'quick-actions-container';
        
        const title = document.createElement('div');
        title.className = 'quick-actions-title';
        title.textContent = 'Popular questions:';
        
        const grid = document.createElement('div');
        grid.className = 'quick-actions-grid';
        
        // Show 8 random quick actions
        const shuffled = [...this.quickActions].sort(() => 0.5 - Math.random());
        shuffled.slice(0, 8).forEach(action => {
            const button = document.createElement('button');
            button.className = 'quick-action-btn';
            button.textContent = action.text;
            button.dataset.type = action.type;
            button.title = `Ask: ${action.text}`;
            grid.appendChild(button);
        });
        
        actionsDiv.appendChild(title);
        actionsDiv.appendChild(grid);
        chatBody.appendChild(actionsDiv);
        
        this.scrollToBottom();
    }
    
    showTypingIndicator() {
        if (this.isTyping) return;
        
        this.isTyping = true;
        const chatBody = document.getElementById('chat-body');
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typing-indicator';
        
        typingDiv.innerHTML = `
            <div class="typing-text">${this.config.botName} is typing</div>
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        
        chatBody.appendChild(typingDiv);
        this.scrollToBottom();
    }
    
    removeTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    showProactiveNotification() {
        if (!this.settings.showProactive || this.isOpen) return;
        
        const notification = document.getElementById('chat-proactive-notification');
        notification.classList.add('active');
        
        // Play notification sound
        if (this.settings.sounds) {
            this.playSound('notification');
        }
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            this.hideProactiveNotification();
        }, 10000);
    }
    
    hideProactiveNotification() {
        const notification = document.getElementById('chat-proactive-notification');
        notification.classList.remove('active');
        
        if (this.proactiveTimer) {
            clearTimeout(this.proactiveTimer);
            this.proactiveTimer = null;
        }
    }
    
    showHistoryPanel() {
        document.getElementById('chat-history-panel').classList.add('active');
        this.loadHistoryIntoPanel();
    }
    
    hideHistoryPanel() {
        document.getElementById('chat-history-panel').classList.remove('active');
    }
    
    showSettingsPanel() {
        document.getElementById('chat-settings-panel').classList.add('active');
        this.loadSettingsIntoPanel();
    }
    
    hideSettingsPanel() {
        document.getElementById('chat-settings-panel').classList.remove('active');
    }
    
    loadHistoryIntoPanel() {
        const historyContent = document.getElementById('history-content');
        
        if (this.history.length === 0) {
            historyContent.innerHTML = `
                <div class="no-history">
                    <i class="fas fa-comment-slash"></i>
                    <h4>No Chat History</h4>
                    <p>Your chat history will appear here after conversations.</p>
                </div>
            `;
            return;
        }
        
        let html = '<div class="history-sessions">';
        
        // Sort by date (newest first)
        const sortedHistory = [...this.history].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sortedHistory.forEach(session => {
            const date = new Date(session.date);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            // Get preview text (first user message or first bot response)
            let preview = 'No messages';
            if (session.messages.length > 0) {
                const firstMessage = session.messages[0];
                preview = firstMessage.text.length > 50 ? firstMessage.text.substring(0, 50) + '...' : firstMessage.text;
            }
            
            html += `
                <div class="history-session" data-session-id="${session.id}">
                    <div class="session-date">${formattedDate}</div>
                    <div class="session-preview">${preview}</div>
                </div>
            `;
        });
        
        html += '</div>';
        historyContent.innerHTML = html;
        
        // Add click event to load session
        historyContent.querySelectorAll('.history-session').forEach(sessionDiv => {
            sessionDiv.addEventListener('click', () => {
                const sessionId = sessionDiv.dataset.sessionId;
                this.loadSession(sessionId);
                this.hideHistoryPanel();
            });
        });
    }
    
    loadSession(sessionId) {
        const session = this.history.find(s => s.id === sessionId);
        if (!session) return;
        
        // Clear current chat
        const chatBody = document.getElementById('chat-body');
        chatBody.innerHTML = '';
        
        // Add session messages
        session.messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${msg.sender}`;
            
            const time = new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            messageDiv.innerHTML = `
                <div class="message-content">${this.formatMessage(msg.text)}</div>
                <div class="message-time">${time}</div>
            `;
            
            chatBody.appendChild(messageDiv);
        });
        
        // Update current session
        this.currentSession = { ...session };
        
        this.scrollToBottom();
    }
    
    loadSettingsIntoPanel() {
        const settingsContent = document.getElementById('settings-content');
        
        settingsContent.innerHTML = `
            <div class="settings-group">
                <h4><i class="fas fa-bell"></i> Notifications</h4>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">Chat Sounds</div>
                        <div class="setting-description">Play sound when receiving new messages</div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="setting-sounds" ${this.settings.sounds ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">Proactive Help</div>
                        <div class="setting-description">Show helpful suggestions based on your activity</div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="setting-proactive" ${this.settings.showProactive ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>
            
            <div class="settings-group">
                <h4><i class="fas fa-history"></i> History</h4>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">Save Chat History</div>
                        <div class="setting-description">Store your conversations for future reference</div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="setting-save-history" ${this.settings.saveHistory ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="setting-item">
                    <div>
                        <div class="setting-label">Auto-clear History</div>
                        <div class="setting-description">Automatically clear history older than 30 days</div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="setting-auto-clear" ${this.settings.autoClear ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>
            
            <div class="settings-group">
                <h4><i class="fas fa-database"></i> Data Management</h4>
                <button class="btn btn-outline btn-block" id="clear-history-btn" style="margin-bottom: 0.5rem;">
                    <i class="fas fa-trash"></i> Clear All History
                </button>
                <button class="btn btn-outline btn-block" id="export-history-btn">
                    <i class="fas fa-download"></i> Export Chat History
                </button>
            </div>
        `;
        
        // Add event listeners for settings
        document.getElementById('setting-sounds').addEventListener('change', (e) => {
            this.settings.sounds = e.target.checked;
            this.saveSettings();
        });
        
        document.getElementById('setting-proactive').addEventListener('change', (e) => {
            this.settings.showProactive = e.target.checked;
            this.saveSettings();
        });
        
        document.getElementById('setting-save-history').addEventListener('change', (e) => {
            this.settings.saveHistory = e.target.checked;
            this.saveSettings();
        });
        
        document.getElementById('setting-auto-clear').addEventListener('change', (e) => {
            this.settings.autoClear = e.target.checked;
            this.saveSettings();
        });
        
        document.getElementById('clear-history-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
                this.clearHistory();
                this.hideSettingsPanel();
            }
        });
        
        document.getElementById('export-history-btn').addEventListener('click', () => {
            this.exportHistory();
        });
    }
    
    // Utility Methods
    formatMessage(text) {
        // Convert markdown-like formatting
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    }
    
    adjustTextareaHeight(textarea) {
        textarea.style.height = 'auto';
        const newHeight = Math.min(textarea.scrollHeight, 120);
        textarea.style.height = newHeight + 'px';
    }
    
    scrollToBottom() {
        const chatBody = document.getElementById('chat-body');
        if (chatBody) {
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    }
    
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    incrementUnreadCount() {
        this.unreadCount++;
        this.updateUnreadCount();
        
        // Play sound for unread message if chat is closed
        if (!this.isOpen && this.settings.sounds) {
            setTimeout(() => {
                this.playSound('notification');
            }, 300);
        }
    }
    
    markAsRead() {
        this.unreadCount = 0;
        this.updateUnreadCount();
    }
    
    updateUnreadCount() {
        const badge = document.getElementById('chat-badge');
        if (this.unreadCount > 0) {
            badge.style.display = 'flex';
            badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount.toString();
        } else {
            badge.style.display = 'none';
        }
    }
    
    // Storage Methods
    loadSettings() {
        try {
            const saved = localStorage.getItem(this.config.settingsKey);
            this.settings = saved ? JSON.parse(saved) : {
                sounds: true,
                showProactive: true,
                saveHistory: true,
                autoClear: true
            };
        } catch (e) {
            console.error('Error loading chat settings:', e);
            this.settings = {
                sounds: true,
                showProactive: true,
                saveHistory: true,
                autoClear: true
            };
        }
    }
    
    saveSettings() {
        try {
            localStorage.setItem(this.config.settingsKey, JSON.stringify(this.settings));
        } catch (e) {
            console.error('Error saving chat settings:', e);
        }
    }
    
    loadHistory() {
        if (!this.settings.saveHistory) {
            this.history = [];
            return;
        }
        
        try {
            const saved = localStorage.getItem(this.config.storageKey);
            if (saved) {
                this.history = JSON.parse(saved);
                
                // Clean old history if auto-clear is enabled
                if (this.settings.autoClear) {
                    this.cleanOldHistory();
                }
            } else {
                this.history = [];
            }
        } catch (e) {
            console.error('Error loading chat history:', e);
            this.history = [];
        }
    }
    
    saveMessageToHistory(text, sender, type = null) {
        if (!this.settings.saveHistory) return;
        
        // Add to current session
        this.currentSession.messages.push({
            id: Date.now(),
            text,
            sender,
            type,
            time: new Date().toISOString()
        });
        
        // Check if we should start a new session
        const lastMessageTime = this.currentSession.messages.length > 0 
            ? new Date(this.currentSession.messages[this.currentSession.messages.length - 1].time)
            : new Date();
        const timeSinceLastMessage = Date.now() - lastMessageTime.getTime();
        
        // Start new session if last message was more than 30 minutes ago
        if (timeSinceLastMessage > 30 * 60 * 1000) {
            this.saveCurrentSession();
            this.currentSession = {
                id: this.generateSessionId(),
                date: new Date().toISOString(),
                messages: [{
                    id: Date.now(),
                    text,
                    sender,
                    type,
                    time: new Date().toISOString()
                }]
            };
        }
        
        // Auto-save every 5 messages
        if (this.currentSession.messages.length >= 5) {
            this.saveCurrentSession();
        }
    }
    
    saveCurrentSession() {
        if (this.currentSession.messages.length === 0) return;
        
        // Check if this session already exists in history
        const existingIndex = this.history.findIndex(s => s.id === this.currentSession.id);
        
        if (existingIndex >= 0) {
            // Update existing session
            this.history[existingIndex] = { ...this.currentSession };
        } else {
            // Add new session
            this.history.push({ ...this.currentSession });
        }
        
        // Keep only last 50 sessions
        if (this.history.length > 50) {
            this.history = this.history.slice(-50);
        }
        
        this.saveHistoryToStorage();
    }
    
    saveHistoryToStorage() {
        try {
            localStorage.setItem(this.config.storageKey, JSON.stringify(this.history));
        } catch (e) {
            console.error('Error saving chat history:', e);
        }
    }
    
    cleanOldHistory() {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.config.maxHistoryDays);
        
        this.history = this.history.filter(session => {
            const sessionDate = new Date(session.date);
            return sessionDate >= cutoffDate;
        });
        
        this.saveHistoryToStorage();
    }
    
    clearHistory() {
        this.history = [];
        this.currentSession.messages = [];
        localStorage.removeItem(this.config.storageKey);
        
        // Reload chat with welcome message
        const chatBody = document.getElementById('chat-body');
        chatBody.innerHTML = '';
        this.addWelcomeMessage();
    }
    
    exportHistory() {
        const dataStr = JSON.stringify(this.history, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `smartpark-chat-history-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
    
    // Theme Integration
    updateTheme() {
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) {
            // Force reflow to update CSS variables
            chatContainer.style.display = 'none';
            chatContainer.offsetHeight; // Trigger reflow
            chatContainer.style.display = '';
        }
        
        // Update close buttons specifically
        const closeButtons = document.querySelectorAll('#close-history-btn, #close-settings-btn');
        closeButtons.forEach(btn => {
            btn.style.background = 'var(--bg-primary)';
            btn.style.color = 'var(--text-tertiary)';
            btn.style.borderColor = 'var(--border-color)';
        });
    }
}

// Initialize when DOM is ready
let liveChat;

// Make sure DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        liveChat = new LiveChatSystem();
        window.liveChat = liveChat;
    });
} else {
    liveChat = new LiveChatSystem();
    window.liveChat = liveChat;
}

// Theme integration
document.addEventListener('themechange', () => {
    setTimeout(() => {
        if (window.liveChat) {
            window.liveChat.updateTheme();
        }
    }, 100);
});

// Export for use in other scripts 
window.LiveChatSystem = LiveChatSystem;