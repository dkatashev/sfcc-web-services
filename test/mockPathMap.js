'use strict';

const path = require('path');
const proxyquire = require('proxyquire').noCallThru();

const cartridge = '../cartridges/lib_webservice/cartridge';

const pathMap = {
  'dw/util/Map': require('./mocks/dw/util/Map'),
  'dw/util/Bytes': require('./mocks/dw/util/Bytes'),
  'dw/crypto/Encoding': require('./mocks/dw/crypto/Encoding'),
  'dw/net/FTPClient': require('./mocks/dw/net/FTPClient'),
  'dw/net/SFTPClient': require('./mocks/dw/net/SFTPClient'),
  'dw/net/WebDAVClient': require('./mocks/dw/net/WebDAVClient'),
  'dw/net/WebDAVFileInfo': require('./mocks/dw/net/WebDAVFileInfo'),
  'dw/net/HTTPRequestPart': require('./mocks/dw/net/HTTPRequestPart'),
  'dw/svc/Result': require('./mocks/dw/svc/Result'),
  'dw/svc/Service': require('./mocks/dw/svc/Service'),
  'dw/svc/ServiceCredential': require('./mocks/dw/svc/ServiceCredential'),
  'dw/svc/ServiceProfile': require('./mocks/dw/svc/ServiceProfile'),
  'dw/svc/LocalServiceRegistry': require('./mocks/dw/svc/LocalServiceRegistry'),
  'dw/system/Cache': require('./mocks/dw/system/Cache'),
  'dw/system/CacheMgr': require('./mocks/dw/system/CacheMgr'),
  'dw/ws/Port': require('./mocks/dw/ws/Port'),
  'dw/ws/WSUtil': require('./mocks/dw/ws/WSUtil'),
};

pathMap['*/cartridge/scripts/util/ByteStream'] = proxyquire(path.join(cartridge, 'scripts/util/ByteStream'), {
  'dw/util/Bytes': pathMap['dw/util/Bytes'],
});
pathMap['*/cartridge/scripts/util/contentHeader'] = proxyquire(path.join(cartridge, 'scripts/util/contentHeader'), {});
pathMap['*/cartridge/scripts/util/headers'] = proxyquire(path.join(cartridge, 'scripts/util/headers'), {});
pathMap['*/cartridge/scripts/util/multipart'] = proxyquire(path.join(cartridge, 'scripts/util/multipart'), {
  'dw/util/Bytes': pathMap['dw/util/Bytes'],
  '*/cartridge/scripts/util/ByteStream': pathMap['*/cartridge/scripts/util/ByteStream'],
  '*/cartridge/scripts/util/headers': pathMap['*/cartridge/scripts/util/headers'],
});
pathMap['*/cartridge/scripts/util/urlencoded'] = proxyquire(path.join(cartridge, 'scripts/util/urlencoded'), {
  'dw/crypto/Encoding': pathMap['dw/crypto/Encoding'],
});

pathMap['*/cartridge/scripts/webservice/BaseService'] = proxyquire(path.join(cartridge, 'scripts/webservice/BaseService'), {
  'dw/svc/LocalServiceRegistry': pathMap['dw/svc/LocalServiceRegistry'],
});
pathMap['*/cartridge/scripts/webservice/RestService'] = proxyquire(path.join(cartridge, 'scripts/webservice/RestService'), {
  'dw/net/HTTPRequestPart': pathMap['dw/net/HTTPRequestPart'],
  '*/cartridge/scripts/util/multipart': pathMap['*/cartridge/scripts/util/multipart'],
  '*/cartridge/scripts/util/urlencoded': pathMap['*/cartridge/scripts/util/urlencoded'],
  '*/cartridge/scripts/util/contentHeader': pathMap['*/cartridge/scripts/util/contentHeader'],
  '*/cartridge/scripts/webservice/BaseService': pathMap['*/cartridge/scripts/webservice/BaseService'],
});
pathMap['*/cartridge/scripts/webservice/RestAuthService'] = proxyquire(path.join(cartridge, 'scripts/webservice/RestAuthService'), {
  'dw/system/CacheMgr': pathMap['dw/system/CacheMgr'],
  '*/cartridge/scripts/webservice/RestService': pathMap['*/cartridge/scripts/webservice/RestService'],
});
pathMap['*/cartridge/scripts/webservice/SFTPService'] = proxyquire(path.join(cartridge, 'scripts/webservice/SFTPService'), {
  'dw/net/FTPClient': pathMap['dw/net/FTPClient'],
  'dw/net/SFTPClient': pathMap['dw/net/SFTPClient'],
  '*/cartridge/scripts/webservice/BaseService': pathMap['*/cartridge/scripts/webservice/BaseService'],
});
pathMap['*/cartridge/scripts/webservice/SOAPService'] = proxyquire(path.join(cartridge, 'scripts/webservice/SOAPService'), {
  'dw/ws/Port': pathMap['dw/ws/Port'],
  'dw/ws/WSUtil': pathMap['dw/ws/WSUtil'],
  '*/cartridge/scripts/webservice/BaseService': pathMap['*/cartridge/scripts/webservice/BaseService'],
});
pathMap['*/cartridge/scripts/webservice/WebDavService'] = proxyquire(path.join(cartridge, 'scripts/webservice/WebDavService'), {
  'dw/net/WebDAVClient': pathMap['dw/net/WebDAVClient'],
  '*/cartridge/scripts/webservice/BaseService': pathMap['*/cartridge/scripts/webservice/BaseService'],
});

module.exports = pathMap;
