# SmartPark – Real-Time Parking Management System

![HTML](https://img.shields.io/badge/HTML-5-orange)

![CSS](https://img.shields.io/badge/CSS-3-blue)

![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow)

![Status](https://img.shields.io/badge/status-active-success)

SmartPark is a **web-based smart parking management system** designed to monitor parking space availability in real time and allow users to reserve parking slots easily. The system provides an interactive parking map, booking workflow, pricing plans, and a user dashboard for managing reservations.

## Features
* Real-time parking slot availability monitoring
* Interactive parking map with multi-floor support
* Smart parking slot booking system
* Vehicle information entry during booking
* Dynamic pricing plans (Hourly, Daily, Monthly)
* Payment workflow simulation
* User dashboard for managing bookings
* Dark mode and theme customization
* Responsive design for mobile and desktop
* Parking statistics and analytics display

## Screenshots

### Home Page

![Home](screenshots/home.png)

## System Architecture
User
↓
Frontend Interface (HTML, CSS)
↓
JavaScript Application Logic
↓
Parking Slot Management System
↓
Booking & Payment Simulation
↓
LocalStorage (User Data, Bookings, Payments)
↓
Dashboard & Booking History

## Tech Stack

### Frontend
* HTML5
* CSS3
* JavaScript (Vanilla JS)

### Libraries & Tools
* Font Awesome Icons
* Google Fonts
* LocalStorage for data storage
* VS Code for development

## Project Structure
smartpark-real-time-parking-management-system
│
├── index.html
├── script.js
├── style.css
├── theme.css
├── theme.js
├── theme-integration.js
├── vehicle.js
├── imagescript.js
├── livechat.js
├── livechat.css
│
├── sounds/
│
├── screenshots/
│   ├── home.png
│   ├── parking-map.png
│   ├── booking.png
│   └── dashboard.png
│
├── demo-video.mp4
│
└── README.md

## System Workflow
User → View Parking Availability → Select Parking Slot → Enter Vehicle Details → Choose Pricing Plan → Payment Simulation → Booking Confirmation → Dashboard Management

## Demo
A demonstration video of the SmartPark system is included in the repository.
demo-video.mp4

## Future Improvements
* IoT sensor integration for real parking detection
* Database integration (MySQL or Firebase)
* GPS-based parking search functionality
* AI-based parking prediction system
