USER GUIDE
❖
WHAT IS THE EVT – CES APPLICATION
▪ Overview:
The EV Tax Credit Eligibility application allows users to check whether their electric vehicles (EVs) qualify for a $7,500 tax credit based on their assembly location and critical mineral sourcing. The application displays the assembly location on a map and provides a status message indicating whether the vehicle qualifies for the tax credit.
▪ Application is deployed on Google App Engine, you can access the link below:
https://sp24-finalproject-teamorange.uc.r.appspot.com/ 

❖ Main Interface Page
![image](https://github.com/AhmedMujaddidi/EVT-CES/assets/132592296/27ff573d-57df-4f9a-a302-08e7b234b73e)

➢
Step 1: Once you reach the index.html page. You need to upload the given PDF of one of the Electric Vehicles (Ford Mach E or KIA EV6).
➢
Step 2: Click on Choose File
➢
Step 3: Click on the Uploads Button
➢
Step 4: An alert will appear on the Google Cloud Shell console stating data has been successfully inserted into the Firestore (default) database and BigQuery (creditTracking) database.

❖ Customer Details Page (summary.html)
![image](https://github.com/AhmedMujaddidi/EVT-CES/assets/132592296/1e308bf5-6008-4791-9219-fd7124fdd6be)

▪ On this page you are required to add your details (USER) such as First Name, Last Name, VIN (Vehicle Identification Number), Purchase Price, License ID, and License Plate.
➢ This data will be sent to a BigQuery Database named “userdetails” and the data will be recorded for future data study.
➢ On the Google Cloud Shell Console and alert will appear stating the Data has been successfully inserted into the userdetails database.

❖ Electric Vehicle Tax Credit Qualification Page (result.html)
![image](https://github.com/AhmedMujaddidi/EVT-CES/assets/132592296/671c00e7-aafe-4af3-bcb8-d226535728e4)

This page will give the user the Assembly Plant Location of the Electric Vehicle and especially in which country the EV was produced.
▪ The UI will show the Electric Vehicle Thumbnail image on the Google Maps and a message on the UI will state whether the EV qualifies for the EV Tax Credit or not.
➢ Step 1: Click on the dropdown menu and choose the Correct Electric Vehicle Model, (Please choose the EV Model that was on the PDF)
➢ Step 2: Once the Electric Vehicle Model is chosen the Google Maps will load the Assembly plant location and on the UI the message will state whether the EV QUALIFIES, PARTIALLY QUALIFIES, or DOES NOT QUALIFY for the EV tax Credit.
➢ Step 3: This step marks the end of the process to check whether the user’s Electric Vehicle qualifies for the EV tax Credit or not.
