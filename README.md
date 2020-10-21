# ios-scriptable

Is a repository with some scripts for the [Scriptable App](https://scriptable.app/) on iOS

<p align="center">
    <a href="https://scriptable.app/">
        <img width=120" src="images/scriptable.png">
    </a>
</p>

## Installation of a script

1. Download the [Scriptable App](https://apps.apple.com/us/app/scriptable/id1405459188?uo=4)
2. Either Install the [import_scripts](https://github.com/PascalBru/ios-scriptable/blob/main/import_scripts.js) viw App or via iCloud Drive
3. Import via App
3.1. copy the complete content of the file
3.2. start Scriptible and add new script with *+-Button* on top right
3.3. paste copied script
3.4. close editor with *done* on top left
3.5. IMPORTANT!!!: long press new *Untitled Script* and rename it to "import_scripts"
4. Import via iCloud Drive with Mac
4.1. Just execute the following command from a Mac with access to your iOS-Icloud
```
curl https://raw.githubusercontent.com/PascalBru/ios-scriptable/main/import_scripts.js --output "/Users/markus/Library/Mobile Documents/iCloud~dk~simonbs~Scriptable/Documents/import_scripts.js"
```

## Install a script as widget

1. long press on screen with app icons until they are shaking
2. press *+* on top left
3. search for scriptable
4. add prefered widget size
5. tap empty widget
6. select name of script and set interacting to run script

## List of Scripts

* Covid-19
  * Widget 7 days incidence of area [widget_covid19_7day_incidence_areas.js](widget_covid19_7day_incidence_areas.js)
  <img src="images/widget_covid19_7day_incidence_areas.png" width="120"/> 
  
  To Import just Tap:
  scriptable:///run?scriptName=import_scripts&name=COVID-19&contentPath=https%3A%2F%2Fraw.githubusercontent.com%2FPascalBru%2Fios-scriptable%2Fmain%2Fwidget_covid19_7day_incidence_areas.js
