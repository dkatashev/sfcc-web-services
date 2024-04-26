# SFCC Web Service Library

A library for accelerating the development of Web Services in the Salesforce Commerce Cloud platform.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
  - [REST Web Service](#rest-web-service)
  - [SOAP Web Service](#soap-web-service)
  - [SFTP Web Service](#sftp-web-service)
  - [WebDAV Web Service](#webdav-web-service)
  - [Email Web Service](#email-web-service)
- [Customization](#customization)
- [Contributing](#contributing)

## Installation

1. **Clone or Download**: Begin by cloning this repository or downloading the ZIP file to your local machine.
2. **Itegrate into Your Project**: Add the `lib_webservice` cartridge folder or submodule to your project's source code.
3. Deploy to SFCC Instance:
- Upload the cartridge to your SFCC instance using WebDAV or through Business Manager.
- Set up cartridge dependencies by including `lib_webservice` in your cartridge path configuration.

> `lib_webservice` cartridge have no dependencies and could be added at the end(right in cartridge path).

## Usage

Before diving into the library, it's essential to review the official Salesforce Commerce Cloud Web Service documentation:

- [Official Web Service guide](https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-webservices.html)
- [Package - dw.svc - API](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/index.html?target=package_dw_svc.html)

All code in this library is well-documented with proper types. Be sure to check the service code before usage.

Basic usage:

```javascript
// require of the necessary service
var BaseService = require('*/cartridge/scripts/webservice/BaseService');

// your service definition
var YourService = BaseService.extend({
  // service configuration map between aliases and actual service IDs
  SERVICE_CONFIGURATIONS: {
    // configured service ID from Business Manager or Meta Data
    default: 'your.http.service'
  }
});

// now you are able to use fetch
var result = YourService.fetch('default', {
  // service call parameters
});

// default alias could be omitted
var result = YourService.fetch({
  // service call parameters
});
```

Advanced usage:

```javascript
// require of the necessary service
var BaseService = require('*/cartridge/scripts/webservice/BaseService');

// your service definition
var YourService = BaseService.extend({
  // service configuration map between aliases and actual service IDs
  SERVICE_CONFIGURATIONS: {
    // configured service ID from Business Manager or Meta Data
    default: 'your.http.service'
  },

  // encapsulate logic in public method
  sendOrder: function (order) {
    return this.fetch({
      // service call parameters
    });
  }
});

// using your defined methods
var result = YourService.sendOrder(order);
```

### REST Web Service

Configure Service in Business Manager/Meta with type: **HTTP**.

More about HTTP Client - [dw.net.HTTPClient](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/index.html?target=class_dw_net_HTTPClient.html);

```javascript
var RestService = require('*/cartridge/scripts/webservice/RestService');

// your service definition
var YourRestService = RestService.extend({
  // service configuration map between aliases and actual service IDs
  SERVICE_CONFIGURATIONS: {
    // configured service ID from Business Manager or Meta Data
    default: 'your.http.service'
  },

  /**
   * @param {dw.order.Order} order
   * @returns {dw.svc.Result}
   */
  sendOrder: function (order) {
    // inline object
    var data = {
      ID: order.ID
    };

    // or usage with models
    var SendOrderRequest = require('*/cartridge/models/ws/YourRestService/SendOrderRequest');
    var data = new SendOrderRequest(order);

    return this.fetch({
      method: 'POST',
      dataType: 'json',
      data: data
    });
  }
});
```

For services where additional authentication needed(for example oAuth2):

```javascript
var RestAuthService = require('*/cartridge/scripts/webservice/RestAuthService');

// your service definition
var YourRestService = RestAuthService.extend({
  // service configuration map between aliases and actual service IDs
  SERVICE_CONFIGURATIONS: {
    // configured service ID from Business Manager or Meta Data
    default: 'your.http.service',
    auth: 'your.http.service',
  },

  // Custom Cache ID where Authentication details stored(type and credentials)
  CACHE_ID: 'your.http.service.cache',

  /**
   * Performs authorization using the 'auth' service action.
   *
   * @returns {dw.svc.Result} The result of the authorization request.
   */
  authorize: function () {
    return this.fetch('auth', {
      method: 'POST',
      dataType: 'form',
      data: {
        grant_type: 'client_credentials'
      }
    });
  },

  /**
   * @param {dw.order.Order} order
   * @returns {dw.svc.Result}
   */
  sendOrder: function (order) {
    // inline object
    var data = {
      ID: order.ID
    };

    // or usage with models
    var SendOrderRequest = require('*/cartridge/models/ws/YourRestService/SendOrderRequest');
    var data = new SendOrderRequest(order);

    return this.fetch({
      getAuthentication: this.getAuthentication.bind(this),
      method: 'POST',
      dataType: 'json',
      data: data
    });
  }
});


```

### SOAP Web Service

Configure Service in Business Manager/Meta with type: **SOAP**.

For SOAP-based services, you can integrate them seamlessly into your project.

```javascript
var SOAPService = require('*/cartridge/scripts/webservice/SOAPService');

// your service definition
var YourSOAPService = SOAPService.extend({
  // service configuration map between aliases and actual service IDs
  SERVICE_CONFIGURATIONS: {
    // configured service ID from Business Manager or Meta Data
    default: 'your.soap.service'
  },

  /**
   * @param {dw.order.Order} order
   * @returns {dw.svc.Result}
   */
  sendOrder: function (order) {
    return this.fetch({
      webReference: 'wsdlName',
      // if not send service object - defaultService will be used
      service: {
        name: 'Some',
        port: 'SendOrder'
      },
      // is used during execute callback
      operation: 'sendOrder',
      // callback for request creation
      getRequest: function (svc, webReference) {
        var request = new webReference.OrderRequest();
        request.orderNo = order.orderNo;
        return request;
      }
    });
  }
});
```

### SFTP Web Service

Configure Service in Business Manager/Meta with type: **FTP**.

When dealing with SFTP operations, leverage the provided [dw.net.SFTPClient](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/index.html?target=class_dw_net_SFTPClient.html):

```javascript
var SFTPService = require('*/cartridge/scripts/webservice/SFTPService');

// your service definition
var YourSFTPService = SFTPService.extend({
  // service configuration map between aliases and actual service IDs
  SERVICE_CONFIGURATIONS: {
    // configured service ID from Business Manager or Meta Data
    default: 'your.sftp.service'
  },

  // one operation
  downloadFile: function() {
    var File = require('dw/io/File');

    var path = 'path/to/file.xml';
    var encoding = 'UTF-8';
    var outputFile = new File(File.IMPEX, 'path/to/output.xml');

    return this.fetch({
      operation: 'get',
      args: [
        path,
        encoding,
        outputFile
      ]
    });
  },

  // chain of operations
  complexTask: function() {
    /**
     * @param {dw.svc.FTPService} svc
     */
    var onExecute = function(svc) {
      var client = svc.client;

      if (client.cd('path/to')) {
        return client.del('file.xml')
      }

      return false;
    };

    return this.fetch({
      onExecute: onExecute
    });
  }
});
```

### WebDAV Web Service

Configure Service in Business Manager/Meta with type: **Generic**.

For WebDAV operations, it utilize the [dw.net.WebDAVClient](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/index.html?target=class_dw_net_WebDAVClient.html):

```javascript
var WebDavService = require('*/cartridge/scripts/webservice/WebDavService');

// your service definition
var YourWebDavService = WebDavService.extend({
  // service configuration map between aliases and actual service IDs
  SERVICE_CONFIGURATIONS: {
    // configured service ID from Business Manager or Meta Data
    default: 'your.webdav.service'
  },

  // one operation
  downloadFile: function() {
    var File = require('dw/io/File');

    var path = 'path/to/file.xml';
    var outputFile = new File(File.IMPEX, 'path/to/output.xml');

    return this.fetch({
      operation: 'get',
      args: [
        path,
        outputFile
      ]
    });
  },

  // chain of operations
  complexTask: function() {
    /**
     * @param {dw.svc.FTPService} svc
     */
    var onExecute = function(svc) {
      var client = svc.client;

      if (client.copy('from/path', 'to/path')) {
        return client.del('from/path');
      }

      return false;
    };

    return this.fetch({
      onExecute: onExecute
    });
  }
});
```

### Email Web Service

Configure Service in Business Manager/Meta with type: **Generic**.

For sending emails, it utilize the [dw.net.Mail](https://salesforcecommercecloud.github.io/b2c-dev-doc/docs/current/scriptapi/html/index.html?target=class_dw_net_Mail.html) functionality provided by Salesforce Commerce Cloud:

```javascript
var MailService = require('*/cartridge/scripts/webservice/MailService');

// your service definition
var YourMailService = MailService.extend({
  // service configuration map between aliases and actual service IDs
  SERVICE_CONFIGURATIONS: {
    // configured service ID from Business Manager or Meta Data
    default: 'your.http.service'
  },

  sendEmail: function (templateName, context) {
    var Template = require('dw/util/Template');

    var template = new Template(templateName);

    return this.fetch({
      from: 'test@test.com',
      to: 'some@test.com',
      cc: [
        'cc@test.com'
      ],
      bcc: [
        'bcc@test.com'
      ],
      subject: 'Subject',
      content: {
        body: template.render(context)
      }
    });
  }
});
```

## Customization

You have the flexibility to customize this library to meet your specific needs. You can override existing callback methods and introduce your own protected methods. Additionally, you can define your new Service Types.

You can check `cartridge/scripts/webservice/RestAuthService` as an example.

```javascript
var BaseService = require('*/cartridge/scripts/webservice/BaseService');

var NewServiceType = BaseService.extend({
  createRequest: function (svc, params) {
    var some = this._protectedMethod(svc, params);
  },

  _protectedMethod: function () {
    return 'some';
  }
});
```

## Contributing

We welcome contributions from the community! If you'd like to contribute, please follow these steps:

1. **Fork the Repository**: Start by forking the repository to your own GitHub account.
2. **Create a New Branch**: Create a new branch for your changes.
3. **Make Your Changes**: Implement your changes and test them thoroughly.
4. **Submit a Pull Request**: When your changes are ready, submit a pull request to this repository, detailing the changes you've made and why they are necessary.

Thank you for contributing to the SFCC Web Service Library!
