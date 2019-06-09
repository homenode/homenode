### Goals

* Developer Focused Framework
    * Provide building blocks and composition
    * Hand over more control
    * Configuration is done in code
* Plugin Based Architecture
    * Plugins can register many device types
    * Plugins have the ability to share config across devices
  *   Many instances of a plugin can be created, to support complicated
      setups
* Powerful Automation Engine
    * Keep the automation in the developers hands
    * Provide a simple set of APIs for building and triggering automations
* First class support for Voice Control providers
    * Easy for plugin development to tie into voice providers
* Distributed Server Friendly
  *   Multiple 'nodes' can act as device reporters to the main server
      using the same code base
* Fast
  *   Keeping as much processing local as possible to speed up
      responsiveness.
* Multi Room Support
    * Allow Activities to 'lock' a device for use 


### App Structure

`HomeNode` is the core library. Plugin developers use APIs exposed by
`HomeNode` to register Interfaces and Device Types that work on those
Interfaces. A plugin can register several types of Interfaces and Device
Types, although best practice would be to limit a plugin to one
Interface. As an example, a plugin developed to integrate with the
Phillips Hue ecosystem would expose one interface to connect to the Hue
API, and that same plugin would expose several Device Types to handle
the different bulbs and controllers that Hue offers.

Interfaces share common configuration as a singleton instance. This
allows the connection for many devices to flow through a single
Interface. For flexibility, multiple instances of the same Interface can
be created with different settings allowing users to connect to multiple
different platforms or accounts.

Users can import these plugins, and create instances of an Interface, 
once the Interface is created, devices can be created using any of the
Device Types available on that Interface.

## HomeNode User API

#### Define Plugin Path

Set the plugin directory path.

```js
HomeNode.setPluginPath('./plugins/');
```

#### Load Plugin

Loads a plugin found in the directory set by `HomeNode.setPluginPath()`.

```js
HomeNode.loadPlugin('dax-amp');
```

#### Create a Interface

Creates a instance of an interface. Interfaces are shared between
devices, and typically provide connection and communication between the
devices and 3rd parties or other types of APIs.

```js
HomeNode.interface({
  id: 'speakers',
  type: 'dax-amp',
  name: 'Dax Amplifier',
  config: {
    port: '/dev/cu.usbserial',
    mock: true,
  },
});
````

###### Interface Parameters
* `id` * - User provided unique identifier for this interface. Must be
  lowercase and no spaces.
* `type` * - The type of interface to create. interface types are
  exposed by plugins.
* `name` * - User provided friendly name to help identify this
  interface.
* `config` - A object passed to the interface to set it's available
  options.

\* Are required parameters

#### Create a Device

Create an instance of a device. Devices can only be created through
interfaces, so an interface should be created first. A device represents
a physical or virtual thing that can be controlled or observed or both
by the rest of the system.

```js
HomeNode.device({
  id: 'kitchen',
  interface: 'speakers',
  type: 'zone',
  name: 'Kitchen Speakers',
  config: {
    amp: 1,
    zone: 1,
  },
});
```

###### Device Parameters
* `id` * - User provided unique identifier for this device. Must be
  lowercase and no spaces.
* `interface` * - This should match the `id` of an interface that has
  been created.
* `type` * - The type of device to create. Device types are exposed by
  interfaces.
* `name` * - User provided friendly name to help identify this device.
* `config` - A object passed to the device to set it's available
  options.

\* Are required parameters

#### Debug

Console logs a tree of debug information about the current setup.

```js
HomeNode.tree();
```


## HomeNode Plugin Developer API

Plugins should be self contained, providing everything they need to
connect to and control a users devices.

The basic structure of a plugin is:

```
plugin
├── interface
│   ├── device type
│   └── device type
└── interface
    ├── device type
    ├── device type
    └── device type
```

**Plugin Best Practices**

* Keep them simple, try to only provide 1 interface per plugin to keep
  things organized and maintainable. A good example of when 2 interfaces
  would make sense, is if a 3rd party was to version their product API,
  and connecting and controlling devices was wildly different between
  the 2 APIs that it might make sense to expose the new API on a
  different interface. Keep in mind all the device types would need to
  be re-registered on the new interface.


#### Defining a new Plugin

A new plugin should be exported as a single function in it's `index.js`
of the plugins folder. The main job of this function should be to
register all of the available interface and device types the user can
interact with. No instances of these interfaces or devices will be
created until a user asks the system to.

```js
  // node_modules/my_plugin/index.js
  module.exports = function daxAmpPlugin() {
    
  }
```` 

The `this` of the plugins function will contain the entire plugin API.

#### Registering a new Interface

When a user connects to a Interface, it will act as a singleton for all
devices they configure on it. Interfaces are where all I/O should be
done if possible. For example, if persistent connections need to be
created, they should be make within the interface and not the individual
devices.

```js
  // node_modules/my_plugin/index.js
  module.exports = function daxAmpPlugin() {
    this.registerInterface({
       type: 'dax-amp',
       config: {
         ip_address: {
           type: 'string',
           required: true,
         },
         port: {
           type: 'integer',
           required: false,
           default: 4000
         },
         input_1: {
           type: 'string',
           required: false,
           default: 'Input 1',
         },
         input_2: {
           type: 'string',
           required: false,
           default: 'Input 2',
         },
       },
       startup: function() {
         // Return promise
         this.API = oAuth();
       },
       shutdown: function() {
         // Return promise
       },
       afterAllDeviceStartup: function() {
         // Do Work... setup listeners etc...
         // return promise...
         // Load current state
       }
    });
  }
```` 

#### Registering a new Device Type

```js
  // node_modules/my_plugin/index.js
  module.exports = function daxAmpPlugin() {
    this.registerDevice({
       type: 'zone',
       interface: 'dax-amp',
       config: {
         amp: {
           type: 'integer',
           required: false,
           default: 1,
           min: 1,
           max: 3,
         },
         zone: {
           type: 'integer',
           required: true,
           min: 1,
           max: 6,
         },
       },
       startup: function() {
         // Return promise
       },
       refresh: function() {
         // Return Promise
       },
       refreshEvery: 3600,
       shutdown: function() {
         // Return promise
       },
       traits: {
         power: {
           name: 'Power',
           type: 'bool',
           default: false,
           readOnly: true, // Maybe need this? Could also not map it to anything, or just reject when calling updateTrait()
         },
         volume: {
           name: 'Volume',
           type: 'integer',
           default: 0,
           min: 0,
           max: 38,
           step: 1,
           validate(value) {
             return value >= 1 && value <= 38;
           },
           format(value) {
             // Maybe need this function?
             return parseInt(value);
           },
         },
         mute: {
           name: 'Mute',
           type: 'bool',
           default: false,
         },
         input: {
           name: 'Input Source',
           type: 'integer',
           default: 1,
           min: 1,
           max: 6,
           step: 1,
         }
       },    
       
       // Least thought out....
       traitMapping: {
         power: {
           homekit: {
             characteristic: 'On',
           },
           google: {
             trait: 'OnOff',
           }
         },
         input: {
           google: {
             trait: 'Modes',
           }
         }
       }
    });
  }
````


## Order of Startup Operations

```
- App Startup

- Load Plugins 
- - Register Interfaces
- - Register Device Types

- User creates Interfaces using HomeNode.interface();
- User creates Devices using HomeNode.device();
- User creates Automations using HomeNode.automation();

- HomeNode.start() is called

- Each Interface:
- - Interface.startup() // Could be used to create or open a connection

- Each Device:
- - Device.startup() // Could be used to register this device on the connection, or other do other startup activities

- Each Interface:
- - Interface.afterDevicesStartup() //  All devices are started, ie. could be used to register listeners on the interface.

- Each Device:
- - Device.refresh(); // Reload the state of traits for the device.

- Each Automation:
- - Automation.startup();

- App is now in a running state.

- App Shutdown Started
- - Automation.shutdown();
- - Device.shutdown()
- - Interface.shutdown()

- App Exit();
```


## Considerations..

* Plugin developers will be forced to make their device-types globally
  unique from other developers... this seems like a bad idea. Device
  types should be logically nested within a defined interface.
* Interface types will also need to be unique accross plugins. One way
  to avoid this, would be to specify the plugin whenever creating
  interfaces or plugins. And again, logically nest them within it.

