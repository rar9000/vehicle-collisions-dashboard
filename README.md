# car crash LOUISVILLE

This website is the offspring of my first Code:You project from 2023 when I did my data analysis capstone on vehicle collisions using data downloaded from the website http://crashinformationky.org/. This project was as much a web development project as a major refracting of my original data project.

The problem I initially sought to solve for this web development project was how to make collision data interactive and engaging. I sought to do so by categorizing collisions by Louisville neighborhoods, cities and municipalities as to make the data relatable to residents living in these communities. But the other unexpected problem this project ultimately addressed became something personal to myself: the rise of artificial intelligence and my relationship with it as a coder.

My feelings towards AI were ones of growing discomfort over something I saw as alien, bizarre and increasingly a threat to replacing me as a coder. But after attending the tech event run by Chris Ceballos on how to use cursor AI to create modern web applications I realized AI was to be embraced, had to be embraced. AI could be a tool and benefit to coding, not an existential threat. I needed to test this for myself. This project is the result. It was not done through Cursor but was a continuous dialog in ChatGPT using primarily their default GPT-4o model and occasionally their o3-mini-high model. As where my data analysis project was very much a collaboration with stackoverflow this one was a collaboration with AI, and it certainly was not seamless nor perfect one. It needed clear guidance and correction and required double checking and refracting of any code it gave me. But it ultimately allowed me to achieve a higher vision. A vision that also would not have been possible without the knowledge attained from my expereinces in Code:You.

AI became a tool that helped me to accomplish both my goals for this project: 1. a comfort and skill set using AI to code and an interactive web application that displays car crash data across neighborhoods in Louisville Kentucky. A site that helps users explore crash activity using map-based visuals, a detailed list and dynamic charts. The application uses Leaflet.js to render a clickable map of the city where users can view crash locations, weather data and neighborhood statistics. Chart.js is used to create a bar graph of crash rates and a list view shows every crash ID and location for quick access. The entire site is responsive and works across desktop tablets and mobile devices with orientation-specific layouts.

The mobile version of the site in portrait mode will be without a view of the leaflet map. However if you rotate the device to lanscape mode the map will appear. I'm working out some bugs with this as the map will not always zoom to the expected map position when rotating back and forth between portrait and landscape view. 

At the time of this writing my website only has one day of crash data loaded. I will work on adding more and will continue to update the website with new features in the near future. 

## Features Used

This project fulfills the feature requirements for the capstone by including the following integrations

### Analyze data stored in arrays objects sets or maps  
Crash data is loaded from json files and stored in arrays  
Neighborhood crash totals are stored in objects and mapped to display totals rates and other insights  

### Visualize data in a user friendly way  
A Chart.js bar chart is used to show the top 5 neighborhoods by crash rate per square mile  
Each bar is clickable and zooms the map to the selected neighborhood  

### Create a function that accepts two or more input parameters and returns a calculated value  
A custom function calculates crash rates based on both population and area to determine rate per 1000 people and per square mile  

### Retrieve data from a third-party API and use it to display something in the app  
When a crash point is clicked weather data is fetched using the Open-Meteo API  
The weather description and temperature are displayed in the popup based on the crash time and location  

## Things to try and look for
1. Click it. So much of this web application can be clicked. Crash points, neighborhood boundaries, the bars in the chart, the crash ids and neighborhoods in the data list as well as a reset button to clear everything away if the popups become too cluttered.
2. The map. Defaults to a view of Jefferson County. Can zoom in and out. Has neighborhood boundaries highlighted in red. Clicking a boundary will highlight it in blue. Car collisions appear as red markers. 
3. The data list. It's comprised of all neighborhoods found in Louisville and Jefferson County. Some neighborhoods may appear multiple times in the list depending on how many car collisions occurred in that neighborhood for the given date. If a neighborhood appears with zeros (00000000) it means no collisions occurred for that neighborhood for the given date. Crashes occurring outside a neighborhood appear at the very bottom of the data list. The list highlights the collisions that resulted in the tragic loss of life in red. 
4. Search bar. The search bar can be used to find a specific neighborhood in the data list. The reset button will also clear away search results.
5. The chart. It currently displays the top five neighborhoods for the given date based on a crash rate that was derived from weighing the occurrence of crashes per square mile of a neighborhood. More charts will be added in the near future.

## How to Run My Project

### Option 1: The netlify hosted site

[carcrashlouisville.com](https://carcrashlouisville.com)

(should be up and running)

### Option 2: (local): VS Code Live Server

Option 2 VS Code Live Server
1.	Open the project in Visual Studio Code
2.	Install the Live Server extension if not already installed
3.	Right-click on index.html
4.	Choose “Open with Live Server”
5.	The site will open in the browser on a local server

### Option 3: (local): Netlify Dev

1. Install Node.js from [https://nodejs.org](https://nodejs.org)  
2. Install the Netlify CLI "npm install -g netlify-cli" 
3. Open a terminal and navigate to the project folder  
4. Start the development server by running "netlify dev"  
5. Site should run at `http://localhost:8888`


