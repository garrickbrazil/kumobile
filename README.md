
___
 
## KUMobile

___
KUMobile is a cross-platform mobile application project for Kettering
University. The project is focused on information exchange between Kettering 
and the students. The application targets the following platforms: 
Android, iOS, and Windows.

 
### License

The project is licensed with [GPL-3.0](http://www.gnu.org/licenses/gpl-3.0.txt).

 
### Contact
 
Garrick Brazil - garrick@garrickmail.net
 
___
 
## Getting Started
### Running the App
Download the latest repository and extract the www folder locally. Use a local 
web browser to test functionality starting with the index.html folder. To accomplish
this you can start chrome with "--disable-web-security" in order to allow access to
other domains. Chrome has built in emulation options available by inspecting then clicking 
the phone icon. Alternatively if you have setup Phonegap CLI then you can run "phonegap 
serve" to launch the site.

### Compiling for Mobile Devices
To compile you may use Phonegap's Cloud service available at http://build.phonegap.com,
choose the upload zipfile option, and provide them a zipped www folder! Another option is
to use Phonegap's CLI to compile. This procedure generally requires the correct 
operating system and has a lot of dependencies ([https://github.com/phonegap/phonegap-cli](https://github.com/phonegap/phonegap-cli)). 
Note: in either case you may have to change the config.xml file to have a different widget id.

### Setting up CLI (optional)

The Phonegap / Cordova CLI can be useful for compiling the app locally or
even for local testing.

Using the CLI for compilation will require all the tools for each platform (yes, iOS requires Mac OS and XCode).
All plugins also must be downloaded locally in order to properly build. Please see [install guide](http://phonegap.com/install/) for the setup
procedure and these [docs](https://github.com/phonegap/phonegap-cli) for usage!
 
___
## Documentation

___
Please use [yui-docs](http://yui.github.io/yuidoc/) comment block styling and rules! The 
site documentation is currently hosted at [http://kumobile.info](http://kumobile.info).

### Generating Documentation
To generate a new set of documentation use the Build-docs.cmd script or make a 
similar script for Mac OS / Linux. The command should be ran relative to the 
kumobile root folder and it look like yuidoc -c ./yui-theme/yuidoc.json www/js -C.
