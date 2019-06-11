/*
ZWave Library wrapper that provides an interface to devices in HomeNode

To find the usb port that the z-wave stick is in run this in the terminal before and after
connecting the device to locate it.

ls /dev/tty*
 */

/**
 * Z-Wave: node10: GE, 14294 In-Wall Smart Dimmer
 Z-Wave: node10: name="", type="Light Dimmer Switch", location=""
 Z-Wave: node10: class 38
 Z-Wave: node10: class 39
 Z-Wave: node10: class 94
 Z-Wave: node10: class 112
 Z-Wave: node10: class 115
 Z-Wave: node10: class 134

 Z-Wave: node16: HomeSeer, Unknown: type=4447, id=3036
 Z-Wave: node16: name="", type="Light Dimmer Switch", location=""
 Z-Wave: node16: class 38
 Z-Wave: node16: class 39
 Z-Wave: node16: class 91
 Z-Wave: node16: class 94
 Z-Wave: node16: class 115
 Z-Wave: node16: class 134
 */

const OZW = require('openzwave-shared');

module.exports = {
  type: 'zwave',
  config: {
    port: {
      type: 'string',
      required: true,
    },
    remove_failed_nodes: {
      type: 'boolean',
      default: false,
    },
  },
  startup() {
    this.logger.log('Starting zwave...');

    this.nodes = {};
    this.deadNodeIds = [];

    this.zwave = new OZW({
      ConsoleOutput: false,
    });

    this.zwave.on('driver ready', () => {
      this.logger.log('Starting Scan');
    });

    this.zwave.on('driver failed', () => {
      this.logger.error('Failed to start driver');
    });

    this.zwave.on('node added', (nodeid) => {
      this.nodes[nodeid] = {
        manufacturer: '',
        manufacturerid: '',
        product: '',
        producttype: '',
        productid: '',
        type: '',
        name: '',
        loc: '',
        classes: {},
        ready: false,
      };
    });

    this.zwave.on('value added', (nodeid, comclass, valueId) => {
      if (!this.nodes[nodeid].classes[comclass]) {
        this.nodes[nodeid].classes[comclass] = {};
      }
      this.nodes[nodeid].classes[comclass][valueId.index] = valueId;
    });

    this.zwave.on('value changed', (nodeid, comclass, value) => {
      if (this.nodes[nodeid].ready) {
        this.logger.log(
          'Z-Wave: node%d: changed: %d:%s:%s->%s', nodeid, comclass,
          value.label,
          this.nodes[nodeid].classes[comclass][value.index].value,
          value.value,
        );
      }
      this.nodes[nodeid].classes[comclass][value.index] = value;
    });

    this.zwave.on('value removed', (nodeid, comclass, index) => {
      if (this.nodes[nodeid].classes[comclass] &&
        this.nodes[nodeid].classes[comclass][index]) {
        delete this.nodes[nodeid].classes[comclass][index];
      }
    });

    this.zwave.on('node ready', (nodeId, nodeInfo) => {
      this.nodes[nodeId].manufacturer = nodeInfo.manufacturer;
      this.nodes[nodeId].manufacturerid = nodeInfo.manufacturerid;
      this.nodes[nodeId].product = nodeInfo.product;
      this.nodes[nodeId].producttype = nodeInfo.producttype;
      this.nodes[nodeId].productid = nodeInfo.productid;
      this.nodes[nodeId].type = nodeInfo.type;
      this.nodes[nodeId].name = nodeInfo.name;
      this.nodes[nodeId].loc = nodeInfo.loc;
      this.nodes[nodeId].ready = true;

      this.logger.debug('Node added', this.nodes[nodeId]);

      const manufacturer = nodeInfo.manufacturer || nodeInfo.manufacturerid;
      const product = nodeInfo.product || nodeInfo.productid;

      this.logger.log(`found node (${nodeId}) (${manufacturer}) (${product}) ${nodeInfo.producttype}`);

      this.logger.log('Z-Wave: node%d: name="%s", type="%s", location="%s"', nodeId, nodeInfo.name, nodeInfo.type, nodeInfo.loc);

      for (comclass in this.nodes[nodeId].classes) {
        this.logger.log('Z-Wave: node%d: class %d', nodeId, comclass);

        switch (comclass) {
          case 0x25: // COMMAND_CLASS_SWITCH_BINARY
          case 0x26: // COMMAND_CLASS_SWITCH_MULTILEVEL
            var valueIds = this.nodes[nodeId].classes[comclass];
            for (valueId in valueIds) {
              this.zwave.enablePoll(valueId);
              break;
            }
            this.logger.log('Z-Wave: node%d:   %s=%s', nodeId, values[idx].label, values[idx].value);
        }
      }
    });

    this.zwave.on('notification', (nodeId, typeId) => {
      switch (typeId) {
        case 0:
          this.logger.log(`notification on node (${nodeId}): message complete`);
          break;
        case 1:
          this.logger.log(`notification on node (${nodeId}): timeout`);
          break;
        case 2:
          this.logger.log(`notification on node (${nodeId}): nop`);
          break;
        case 3:
          this.logger.log(`notification on node (${nodeId}): node awake`);
          break;
        case 4:
          this.logger.log(`notification on node (${nodeId}): node sleep`);
          break;
        case 5:
          this.logger.log(`notification on node (${nodeId}): node dead`);
          this.deadNodeIds.push(nodeId);
          break;
        case 6:
          this.logger.log(`notification on node (${nodeId}): node alive`);
          break;
      }
    });

    this.zwave.on('scan complete', () => {
      this.logger.log('Network Scan Complete');

      if (this.deadNodeIds.length) {
        this.logger.log(`Found dead nodes on network: ${this.deadNodeIds.join(',')}`);

        if (this.getConfig('remove_failed_nodes')) {
          this.logger.log('Removing failed nodes');

          this.deadNodeIds.forEach((id) => {
            this.logger.log(`Removing dead node id: ${id}`);
            this.zwave.removeFailedNode(id);
          });
        }
      }

      // this.defered.resolve();
    });

    this.zwave.on('controller command', (nodeId, ctrlState, ctrlError, helpmsg) => {
      //this.logger.log('Controller commmand feedback:', nodeId, ctrlState, ctrlError, helpmsg);
    });

    this.zwave.connect(this.config.port);

    process.on('SIGINT', () => {
      this.logger.log('Disconnecting...');
      this.zwave.disconnect(this.config.port);
      process.exit();
    });
  },
};
