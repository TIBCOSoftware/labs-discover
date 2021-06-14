var WebSocket=WebSocket||require("ws");!function(){function _isArray(a){return Array.isArray?Array.isArray(a):"[object Array]"==Object.prototype.toString.call(a)}function _isDate(d){return"[object Date]"==Object.prototype.toString.call(d)}function _isFunction(f){return"[object Function]"==Object.prototype.toString.call(f)}function _isNumber(n){return"[object Number]"==Object.prototype.toString.call(n)}function _isBoolean(b){return!0===b||!1===b||"[object Boolean]"==Object.prototype.toString.call(b)}function _isObject(o){return o===Object(o)}function _isString(s){return"[object String]"==Object.prototype.toString.call(s)}function _isUndefined(o){return void 0===o}function _isNull(o){return null===o}function _isInteger(n){return n%1==0}function _each(obj,iterator,context){if(null!=obj)if(arrayForEach&&obj.forEach===arrayForEach)obj.forEach(iterator,context);else if(obj.length===+obj.length){for(var i=0,l=obj.length;i<l;i++)if(i in obj&&iterator.call(context,obj[i],i,obj)==={})return}else for(var key in obj)if(Object.prototype.hasOwnProperty.call(obj,key)&&iterator.call(context,obj[key],key,obj)==={})return}function _map(obj,iterator,context){if(null==obj)return[];if(arrayMap&&obj.map===arrayMap)return obj.map(iterator,context);var retVal=[];return _each(obj,function(value,index,list){retVal[retVal.length]=iterator.call(context,value,index,list)}),obj.length===+obj.length&&(retVal.length=obj.length),retVal}function _safeExtend(o){return _each(Array.prototype.slice.call(arguments,1),function(source){var v;for(var key in source)if(source.hasOwnProperty(key)){if(v=source[key],_isNull(v)||_isUndefined(v)||_isFunction(v))continue;_isBoolean(v)&&(v=v.toString()),o[key]=v}}),o}function assertEFTLMessageInstance(message,variableName){var varName=variableName||"message";if(_isUndefined(message))throw new Error(varName+" cannot be undefined");if(_isNull(message))throw new Error(varName+" cannot be null");if(message instanceof eFTLMessage==0)throw new Error(varName+" must be an instance of eFTLMessage")}function parseURL(str){if("object"==typeof module&&module.exports){return(url=require("url")).parse(str)}var url=document.createElement("a");return url.href=str,url.query=url.search&&"?"===url.search.charAt(0)?url.search.substring(1):url.search,-1!==str.indexOf("://")&&-1!==str.indexOf("@")&&(url.auth=str.substring(str.indexOf("://")+3,str.indexOf("@"))),url}function doubleToJson(value,key,list){var retVal={};return isFinite(value)?retVal[DOUBLE_FIELD]=value:retVal[DOUBLE_FIELD]=value.toString(),retVal}function jsonToDouble(raw){return _isNumber(raw[DOUBLE_FIELD])?raw[DOUBLE_FIELD]:parseFloat(raw[DOUBLE_FIELD])}function dateToJson(value,key,list){var millis=value.getTime(),retVal={};return retVal[MILLISECOND_FIELD]=millis,retVal}function jsonToDate(raw){if(void 0!==raw[MILLISECOND_FIELD]){var millis=raw[MILLISECOND_FIELD];return new Date(millis)}}function eFTLMessage(){1===arguments.length&&_safeExtend(this,arguments[0])}function eFTLKVMap(connection,name){this.connection=connection,this.name=name}function eFTLConnection(urls,options){this.urlList=urls,this.urlIndex=0,this.connectOptions=options,this.webSocket=null,this.state=CLOSED,this.clientId=null,this.reconnectToken=null,this.protocol=0,this.timeout=6e5,this.heartbeat=24e4,this.maxMessageSize=0,this.lastMessage=0,this.timeoutCheck=null,this.subscriptions={},this.sequenceCounter=0,this.subscriptionCounter=0,this.reconnectCounter=0,this.autoReconnectAttempts=5,this.autoReconnectMaxDelay=3e4,this.reconnectTimer=null,this.connectTimer=null,this.isReconnecting=!1,this.isOpen=!1,this.qos=!0,this.requests={}}_isUndefined(console)&&(console={},console.log=function(arg){},console.info=function(arg){},console.error=function(arg){});var trustCertificates,openConnections=[],arrayForEach=Array.prototype.forEach,arrayMap=Array.prototype.map,_keys=Object.keys||function(o){if(o!==Object(o))throw new TypeError("Invalid object");var retVal=[];for(var k in o)Object.prototype.hasOwnProperty.call(o,k)&&(retVal[retVal.length]=k);return retVal};"undefined"==typeof btoa&&(btoa=function(str){return new Buffer(str).toString("base64")}),"undefined"==typeof atob&&(atob=function(str){return new Buffer(str,"base64").toString()});var eFTL=function(){};eFTL.prototype.connect=function(url,options){if(_isUndefined(url)||_isNull(url))throw new TypeError("The URL is null or undefined.");var urls=[];_each(url.split("|"),function(u){if(!(u=u.trim()).startsWith("ws:")&&!u.startsWith("wss:"))throw new SyntaxError("The URL's scheme must be either 'ws' or 'wss'.");urls.push(u)}),function(array){for(var i=array.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),temp=array[i];array[i]=array[j],array[j]=temp}}(urls);new eFTLConnection(urls,options).open()},eFTL.prototype.setTrustCertificates=function(certs){trustCertificates=certs},eFTL.prototype.getVersion=function(){return"TIBCO eFTL Version "+EFTL_VERSION};var EFTL_VERSION="6.5.0  V8",DOUBLE_FIELD="_d_",MILLISECOND_FIELD="_m_",OPAQUE_FIELD="_o_";eFTLMessage.prototype.setReceipt=function(sequenceNumber,subscriptionId){this["_eftl:sequenceNumber"]=sequenceNumber,this["_eftl:subscriptionId"]=subscriptionId},eFTLMessage.prototype.getReceipt=function(){return{sequenceNumber:this["_eftl:sequenceNumber"],subscriptionId:this["_eftl:subscriptionId"]}},eFTLMessage.prototype.setReplyTo=function(replyTo,requestId){this["_eftl:replyTo"]=replyTo,this["_eftl:requestId"]=requestId},eFTLMessage.prototype.getReplyTo=function(){return{replyTo:this["_eftl:replyTo"],requestId:this["_eftl:requestId"]}},eFTLMessage.prototype.setStoreMessageId=function(msgId){this["_eftl:storeMessageId"]=msgId},eFTLMessage.prototype.getStoreMessageId=function(){return this["_eftl:storeMessageId"]},eFTLMessage.prototype.toJSON=function(){var result={};for(var k in this)k.startsWith("_eftl:")||(result[k]=this[k]);return result},eFTLMessage.prototype.set=function(fieldName,value){var val=void 0;if(value instanceof eFTLMessage)val=value;else if(_isArray(value))if(value.length>0)if(value[0]instanceof eFTLMessage)val=_map(value,function(o){return o});else if(_isDate(value[0]))val=_map(value,dateToJson);else if(_isString(value[0]))val=value;else{if(!_isNumber(value[0]))throw new TypeError("Unsupported object type: "+typeof value);val=_isInteger(value[0])?value:_map(value,doubleToJson)}else val=value;else if(_isDate(value))val=dateToJson(value);else if(_isString(value))val=value;else if(_isNumber(value))val=_isInteger(value)?value:doubleToJson(value);else if(!1===_isNull(value)&&!1===_isUndefined(value))throw new TypeError("Unsupported object type: "+typeof value);_isUndefined(val)?delete this[fieldName]:this[fieldName]=val},eFTLMessage.prototype.setAsOpaque=function(fieldName,value){_isNull(value)||_isUndefined(value)?delete this[fieldName]:this[fieldName]=function(value,key,list){var retVal={};return retVal[OPAQUE_FIELD]=btoa(value),retVal}(value)},eFTLMessage.prototype.setAsLong=function(fieldName,value){var val=void 0;if(_isArray(value))if(value.length>0){if(!_isNumber(value[0]))throw new TypeError("Unsupported object type: "+typeof value);val=_map(value,Math.floor)}else val=value;else if(_isNumber(value))val=Math.floor(value);else if(!1===_isNull(value)&&!1===_isUndefined(value))throw new TypeError("Unsupported object type: "+typeof value);_isUndefined(val)?delete this[fieldName]:this[fieldName]=val},eFTLMessage.prototype.setAsDouble=function(fieldName,value){var val=void 0;if(_isArray(value))if(value.length>0){if(!_isNumber(value[0]))throw new TypeError("Unsupported object type: "+typeof value);val=_map(value,doubleToJson)}else val=value;else if(_isNumber(value))val=doubleToJson(value);else if(!1===_isNull(value)&&!1===_isUndefined(value))throw new TypeError("Unsupported object type: "+typeof value);_isUndefined(val)?delete this[fieldName]:this[fieldName]=val},eFTLMessage.prototype.get=function(fieldName){var raw=this[fieldName];return _isArray(raw)?raw.length>0&&_isObject(raw[0])?raw[0][DOUBLE_FIELD]?_map(raw,jsonToDouble):raw[0][MILLISECOND_FIELD]?_map(raw,jsonToDate):_map(raw,function(o){return new eFTLMessage(o)}):raw:_isObject(raw)?void 0!==raw[DOUBLE_FIELD]?jsonToDouble(raw):void 0!==raw[MILLISECOND_FIELD]?jsonToDate(raw):void 0!==raw[OPAQUE_FIELD]?function(raw){if(void 0!==raw[OPAQUE_FIELD])return atob(raw[OPAQUE_FIELD])}(raw):new eFTLMessage(raw):raw},eFTLMessage.prototype.getFieldNames=function(){var buf=[];return _each(_keys(this),function(kn){buf.push(kn)}),buf},eFTLMessage.prototype.toString=function(){var msg=this,str="{";return _each(_keys(this),function(kn){var val=msg.get(kn);kn.startsWith("_eftl:")||(str.length>1&&(str+=", "),str+=kn,str+="=",_isArray(val)?(str+="[",str+=val,str+="]"):str+=val)}),str+="}"},eFTLKVMap.prototype.set=function(key,message,options){assertEFTLMessageInstance(message,"Message");var connection=this.connection,envelope={};envelope.op=20,envelope.map=this.name,envelope.key=key;var value=new eFTLMessage(message);envelope.value=value;var sequence=connection._nextSequence();connection.qos&&(envelope.seq=sequence);var request={};request.message=message,request.envelope=envelope,request.sequence=sequence,request.options={onComplete:function(message){options&&options.onSuccess&&options.onSuccess(key,message)},onError:function(message,code,reason){options&&options.onError&&options.onError(key,message,code,reason)}};var data=JSON.stringify(envelope);if(connection.maxMessageSize>0&&data.length>connection.maxMessageSize)throw new Error("Message exceeds maximum message size of "+connection.maxMessageSize);connection.requests[sequence]=request,connection.state===OPEN&&connection._send(envelope,sequence,!1,data)},eFTLKVMap.prototype.get=function(key,options){var connection=this.connection,envelope={};envelope.op=22,envelope.map=this.name,envelope.key=key;var sequence=connection._nextSequence();envelope.seq=sequence;var request={};request.envelope=envelope,request.sequence=sequence,request.options={onComplete:function(message){options&&options.onSuccess&&options.onSuccess(key,message)},onError:function(message,code,reason){options&&options.onError&&options.onError(key,message,code,reason)}};var data=JSON.stringify(envelope);connection.requests[sequence]=request,connection.state===OPEN&&connection._send(envelope,sequence,!1,data)},eFTLKVMap.prototype.remove=function(key,options){var connection=this.connection,envelope={};envelope.op=24,envelope.map=this.name,envelope.key=key;var sequence=connection._nextSequence();connection.qos&&(envelope.seq=sequence);var publish={};publish.envelope=envelope,publish.sequence=sequence,publish.options={onComplete:function(message){options&&options.onSuccess&&options.onSuccess(key,message)},onError:function(message,code,reason){options&&options.onError&&options.onError(key,message,code,reason)}};var data=JSON.stringify(envelope);connection.requests[sequence]=publish,connection.state===OPEN&&connection._send(envelope,sequence,!1,data)};var OPEN=1,CLOSED=3;eFTLConnection.prototype._caller=function(func,context,args){try{func&&func.apply(context,args)}catch(ex){console.error("Exception while calling client callback",ex,ex.stack)}},eFTLConnection.prototype.isConnected=function(){return this.state===OPEN},eFTLConnection.prototype.createMessage=function(){return new eFTLMessage},eFTLConnection.prototype.createKVMap=function(name){return new eFTLKVMap(this,name)},eFTLConnection.prototype.removeKVMap=function(name){var envelope={};envelope.op=18,envelope.map=name,this._send(envelope,0,!1)},eFTLConnection.prototype._send=function(message,seqNum,forceSend){var data=4===arguments.length?arguments[3]:JSON.stringify(message);if(this._debug(">>",message),this.webSocket&&(this.state<2||forceSend))try{this.webSocket.send(data),!this.qos&&seqNum>0&&this._pendingComplete(seqNum)}catch(err){}},eFTLConnection.prototype._subscribe=function(subId,options){var subscription={};subscription.options=options,subscription.id=subId,subscription.pending=!0,subscription.lastSeqNum=0,subscription.autoAck=!0,void 0!==options.ack&&(subscription.autoAck="auto"===options.ack);var subMessage={};subMessage.op=3,subMessage.id=subId,subMessage.matcher=options.matcher,subMessage.durable=options.durable;var opts=_safeExtend({},options);return delete opts.matcher,delete opts.durable,function(o){_each(Array.prototype.slice.call(arguments,1),function(source){for(var key in source)source.hasOwnProperty(key)&&(o[key]=source[key])})}(subMessage,opts),this.subscriptions[subId]=subscription,this._send(subMessage,0,!1),subId},eFTLConnection.prototype._acknowledge=function(sequenceNumber,subscriptionId){if(this.qos&&sequenceNumber){var envelope={};envelope.op=9,envelope.seq=sequenceNumber,void 0!==subscriptionId&&(envelope.id=subscriptionId),this._send(envelope,0,!1)}},eFTLConnection.prototype._sendMessage=function(message,op,to,reqId,timeout,options){var sequence=this._nextSequence(),envelope={};envelope.op=op,envelope.seq=sequence,envelope.body=new eFTLMessage(message),to&&(envelope.to=to,envelope.req=reqId);var publish={};publish.options=options,publish.message=message,publish.envelope=envelope,publish.sequence=sequence;var data=JSON.stringify(envelope);if(this.maxMessageSize>0&&data.length>this.maxMessageSize)throw new Error("Message exceeds maximum message size of "+this.maxMessageSize);if(timeout>0){var connection=this;publish.timer=setTimeout(function(){connection._pendingError(sequence,99,"request timeout")},timeout)}return this.requests[sequence]=publish,this.state===OPEN&&this._send(envelope,sequence,!1,data),publish},eFTLConnection.prototype._disconnect=function(){this.reconnectTimer&&(clearTimeout(this.reconnectTimer),this.reconnectTimer=null,this._clearPending(11,"Disconnected"),this._caller(this.connectOptions.onDisconnect,this.connectOptions,[this,1e3,"Disconnect"])),this._close("Connection closed by user.",!0)},eFTLConnection.prototype._close=function(reason,notifyServer){if(0===this.state||this.state===OPEN){if(this.state=2,this.timeoutCheck&&(clearInterval(this.timeoutCheck),this.timeoutCheck=null),notifyServer){reason=reason||"User Action";var dcMessage={};dcMessage.op=11,dcMessage.reason=reason,this._send(dcMessage,0,!0)}this.webSocket.close()}},eFTLConnection.prototype._handleSubscribed=function(message){var subId=message.id,sub=this.subscriptions[subId];if(null!=sub&&sub.pending){sub.pending=!1;var options=sub.options;this._caller(options.onSubscribe,options,[subId])}},eFTLConnection.prototype._handleUnsubscribed=function(message){var subId=message.id,errCode=message.err,reason=message.reason,sub=this.subscriptions[subId];if(22==errCode&&delete this.subscriptions[subId],null!=sub){sub.pending=!0;var options=sub.options;this._caller(options.onError,options,[subId,errCode,reason])}},eFTLConnection.prototype._handleEvent=function(message){var subId=message.to,seqNum=message.seq,msgId=message.sid,reqId=message.req,replyTo=message.reply_to,data=message.body,sub=this.subscriptions[subId];if(sub&&null!=sub.options){if(!seqNum||seqNum>sub.lastSeqNum){var wsMessage=new eFTLMessage(data);!sub.autoAck&&seqNum&&wsMessage.setReceipt(seqNum,subId),replyTo&&wsMessage.setReplyTo(replyTo,reqId),wsMessage.setStoreMessageId(msgId||0),this._debug("<<",data),this._caller(sub.options.onMessage,sub.options,[wsMessage]),sub.autoAck&&seqNum&&(sub.lastSeqNum=seqNum)}sub.autoAck&&seqNum&&this._acknowledge(seqNum,subId)}},eFTLConnection.prototype._handleEvents=function(messages){for(var i=0,max=messages.length;i<max;i++){var message=messages[i];this._handleEvent(message)}},eFTLConnection.prototype._initWS=function(webSocket){var connection=this;webSocket.onopen=function(arg){var url=parseURL(connection._getURL()),auth=url.auth?url.auth.split(":"):[],username=auth[0],password=auth[1],clientId=function(url,name){var query=url.query;if(query)for(var vars=query.split("&"),i=0;i<vars.length;i++){var pair=vars[i].split("=");if(pair[0]==name)return pair[1]}}(url,"clientId"),loginMessage={};if(loginMessage.op=1,loginMessage.protocol=1,loginMessage.client_type="js",loginMessage.client_version=EFTL_VERSION,username?loginMessage.user=username:connection.connectOptions.hasOwnProperty("username")?loginMessage.user=connection.connectOptions.username:loginMessage.user=connection.connectOptions.user,loginMessage.password=password||connection.connectOptions.password,connection.clientId&&connection.reconnectToken?(loginMessage.client_id=connection.clientId,loginMessage.id_token=connection.reconnectToken):loginMessage.client_id=clientId||connection.connectOptions.clientId,_isNumber(connection.connectOptions.maxPendingAcks)){connection.connectOptions.maxPendingAcks>0&&(loginMessage.max_pending_acks=connection.connectOptions.maxPendingAcks)}_isBoolean(connection.connectOptions._qos)||(connection.connectOptions._qos=!0),connection.qos=connection.connectOptions._qos,_isNumber(connection.connectOptions.autoReconnectAttempts)&&(connection.autoReconnectAttempts=connection.connectOptions.autoReconnectAttempts),_isNumber(connection.connectOptions.autoReconnectMaxDelay)&&(connection.autoReconnectMaxDelay=connection.connectOptions.autoReconnectMaxDelay);var options=_safeExtend({},connection.connectOptions);connection.isReconnecting&&(options._resume="true");_each(["user","username","password","clientId"],function(value){delete options[value]}),loginMessage.login_options=options,connection._send(loginMessage,0,!1)},webSocket.onerror=function(error){},webSocket.onclose=function(evt){if(null!==webSocket&&connection.state!==CLOSED){connection.state=CLOSED,connection.connectTimer&&(clearTimeout(connection.connectTimer),connection.connectTimer=null),connection.timeoutCheck&&(clearInterval(connection.timeoutCheck),connection.timeoutCheck=null),connection.webSocket=null;var index=openConnections.indexOf(this);-1!==index&&openConnections.splice(index,1),(1006!=evt.code&&1012!=evt.code||!connection._scheduleReconnect())&&(connection.isOpen=!1,connection._clearPending(11,"Closed"),connection._caller(connection.connectOptions.onDisconnect,connection.connectOptions,[connection,evt.code,evt.reason?evt.reason:"Connection failed"]))}},webSocket.onmessage=function(rawMessage){var msg=JSON.parse(rawMessage.data);if(connection._debug("<<",msg),connection.lastMessage=(new Date).getTime(),_isArray(msg))try{connection._handleEvents(msg)}catch(err){console.error("Exception on onmessage callback.",err,err.stack)}else try{if(!_isUndefined(msg.op)){var opCode=msg.op;switch(opCode){case 0:connection._send.apply(connection,[msg,0,!1,rawMessage.data]);break;case 2:connection._handleWelcome(msg);break;case 4:connection._handleSubscribed(msg);break;case 6:connection._handleUnsubscribed(msg);break;case 7:connection._handleEvent(msg);break;case 10:connection._handleError(msg);break;case 9:connection._handleAck(msg);break;case 14:connection._handleReply(msg);break;case 26:connection._handleMapResponse(msg);break;default:console.log("Received unknown/unexpected op code - "+opCode,rawMessage.data)}}}catch(err){console.error(err,err.stack)}}},eFTLConnection.prototype._handleWelcome=function(message){var reconnectId=null!=this.reconnectToken,resume="true"===((message._resume||"")+"").toLowerCase();this.clientId=message.client_id,this.reconnectToken=message.id_token,this.timeout=1e3*message.timeout,this.heartbeat=1e3*message.heartbeat,this.maxMessageSize=message.max_size,this.protocol=message.protocol||0,this.qos="true"===((message._qos||"")+"").toLowerCase(),resume||(this._clearPending(11,"Reconnect"),this.lastSequenceNumber=0);var connection=this;this.heartbeat>0&&(this.timeoutCheck=setInterval(function(){var now=(new Date).getTime(),diff=now-connection.lastMessage;diff>connection.timeout&&(connection._debug("lastMessage in timer ",{id:connection.clientId,now:now,lastMessage:connection.lastMessage,timeout:connection.timeout,diff:diff,evaluate:diff>connection.timeout}),connection._close("Connection timeout",!1))},this.heartbeat)),this.state=OPEN,this.reconnectCounter=0,this._resetURLList(),_keys(this.subscriptions).length>0&&!resume&&_each(this.subscriptions,function(value,key){value.lastSeqNum=0}),_keys(this.subscriptions).length>0&&_each(this.subscriptions,function(value,key){connection._subscribe(key,value.options)}),this._sendPending(),reconnectId&&!this.isReconnecting?this._caller(this.connectOptions.onReconnect,this.connectOptions,[this]):this.isReconnecting||this._caller(this.connectOptions.onConnect,this.connectOptions,[this]),this.isReconnecting=!1,this.isOpen=!0},eFTLConnection.prototype._handleError=function(message){var errCode=message.err,reason=message.reason;this._caller(this.connectOptions.onError,this.connectOptions,[this,errCode,reason]),0===this.state&&this._close(reason,!1)},eFTLConnection.prototype._handleAck=function(message){var sequence=message.seq,errCode=message.err,reason=message.reason;_isUndefined(sequence)||(_isUndefined(errCode)||_isNull(errCode)?this._pendingComplete(sequence):this._pendingError(sequence,errCode,reason))},eFTLConnection.prototype._handleReply=function(message){var sequence=message.seq,body=message.body,errCode=message.err,reason=message.reason;_isUndefined(sequence)||(_isUndefined(errCode)||_isNull(errCode)?_isUndefined(body)||_isNull(body)?this._pendingComplete(sequence):this._pendingResponse(sequence,new eFTLMessage(body)):this._pendingError(sequence,errCode,reason))},eFTLConnection.prototype._handleMapResponse=function(message){var sequence=message.seq,value=message.value,errCode=message.err,reason=message.reason;_isUndefined(sequence)||(_isUndefined(errCode)||_isNull(errCode)?_isUndefined(value)||_isNull(value)?this._pendingComplete(sequence):this._pendingResponse(sequence,new eFTLMessage(value)):this._pendingError(sequence,errCode,reason))},eFTLConnection.prototype._sendPending=function(){var sequences=_keys(this.requests);if(sequences.length>0){var self=this;sequences.sort(function(a,b){return a-b}),_each(sequences,function(obj){var seq=obj,req=self.requests[seq];self._send(req.envelope,req.sequence,!1)})}},eFTLConnection.prototype._pendingComplete=function(sequence){var req=this.requests[sequence];null!=req&&(delete this.requests[sequence],null!=req.options&&this._caller(req.options.onComplete,req.options,[req.message]),req.timer&&clearTimeout(req.timer))},eFTLConnection.prototype._pendingResponse=function(sequence,response){var req=this.requests[sequence];null!=req&&(delete this.requests[sequence],null!=req.options&&this._caller(req.options.onComplete,req.options,[response]),req.timer&&clearTimeout(req.timer))},eFTLConnection.prototype._pendingError=function(sequence,errCode,reason){var req=this.requests[sequence];null!=req&&(delete this.requests[sequence],null!=req.options?this._caller(req.options.onError,req.options,[req.message,errCode,reason]):this._caller(this.connectOptions.onError,this.connectOptions,[this,errCode,reason]),req.timer&&clearTimeout(req.timer))},eFTLConnection.prototype._clearPending=function(errCode,reason){var sequences=_keys(this.requests);if(sequences.length>0){var self=this;sequences.sort(function(a,b){return a-b}),_each(sequences,function(obj){var seq=obj,req=self.requests[seq];null!=req.options&&self._caller(req.options.onError,req.options,[req.message,errCode,reason]),delete self.requests[seq]})}},eFTLConnection.prototype._nextSequence=function(){return++this.sequenceCounter},eFTLConnection.prototype._nextSubscriptionSequence=function(){return++this.subscriptionCounter},eFTLConnection.prototype._resetURLList=function(){this.urlIndex=0},eFTLConnection.prototype._nextURL=function(){return++this.urlIndex<this.urlList.length||(this.urlIndex=0,!1)},eFTLConnection.prototype._getURL=function(){return this.urlList[this.urlIndex]},eFTLConnection.prototype.open=function(){this.state=0;try{var options={};void 0!==trustCertificates&&(options.ca=trustCertificates),_isBoolean(this.connectOptions.trustAll)&&this.connectOptions.trustAll&&(options.rejectUnauthorized=!1),this.webSocket=new WebSocket(this._getURL(),["v1.eftl.tibco.com"],options),this._initWS(this.webSocket),openConnections.push(this);var timeout=15e3;_isNumber(this.connectOptions.timeout)&&(timeout=1e3*this.connectOptions.timeout);var webSocket=this.webSocket;this.connectTimer=setTimeout(function(){webSocket.readyState===WebSocket.CONNECTING&&webSocket.close()},timeout)}catch(err){throw console.error(err,err.stack),err}},eFTLConnection.prototype.subscribe=function(options){var subId=this._nextSubscriptionSequence().toString(10);return this._subscribe(subId,options),subId},eFTLConnection.prototype.unsubscribe=function(subscriptionId){var unsubMessage={};unsubMessage.op=5,unsubMessage.id=subscriptionId,this._send(unsubMessage,0,!1),delete this.subscriptions[subscriptionId]},eFTLConnection.prototype.unsubscribeAll=function(){var self=this;_keys(this.subscriptions).length>0&&_each(this.subscriptions,function(value,key){self.unsubscribe(key)})},eFTLConnection.prototype.acknowledge=function(message){var receipt=message.getReceipt();this._acknowledge(receipt.sequenceNumber)},eFTLConnection.prototype.acknowledgeAll=function(message){var receipt=message.getReceipt();this._acknowledge(receipt.sequenceNumber,receipt.subscriptionId)},eFTLConnection.prototype.getClientId=function(){return this.clientId},eFTLConnection.prototype.publish=function(message,options){assertEFTLMessageInstance(message,"Message"),this._sendMessage(message,8,null,0,0,options)},eFTLConnection.prototype.sendRequest=function(request,timeout,options){if(assertEFTLMessageInstance(request,"Message"),this.protocol<1)throw new Error("Send request is not supported with this server");options&&(options.onComplete=options.onReply),this._sendMessage(request,13,null,0,timeout,options)},eFTLConnection.prototype.sendReply=function(reply,request,options){if(assertEFTLMessageInstance(request,"Message"),this.protocol<1)throw new Error("Send reply is not supported with this server");var replyTo=request.getReplyTo();if(!replyTo.replyTo)throw new TypeError("Not a request message.");this._sendMessage(reply,15,replyTo.replyTo,replyTo.requestId,0,options)},eFTLConnection.prototype._scheduleReconnect=function(){if(!this.isOpen&&this._nextURL()){connection=this;return this.reconnectTimer=setTimeout(function(){connection.reconnectTimer=null,connection.isReconnecting=!1,connection.open()},0),!0}if(this.isOpen&&this.reconnectCounter<this.autoReconnectAttempts){var ms=0;if(!this._nextURL()){var jitter=Math.random()+.5;ms=Math.min(1e3*Math.pow(2,this.reconnectCounter++)*jitter,this.autoReconnectMaxDelay)}var connection=this;return this.reconnectTimer=setTimeout(function(){connection.reconnectTimer=null,connection.isReconnecting=!0,connection.open()},ms),!0}return!1},eFTLConnection.prototype.reconnect=function(){this.state===CLOSED&&(this.isReconnecting=!1,this.open())},eFTLConnection.prototype.disconnect=function(){this._disconnect()},eFTLConnection.prototype._debug=function(arg){if(this.connectOptions&&this.connectOptions.debug){var args=Array.prototype.slice.call(arguments);console.log(args)}},String.prototype.startsWith||(String.prototype.startsWith=function(searchString,position){return position=position||0,this.substr(position,searchString.length)===searchString}),String.prototype.trim||(String.prototype.trim=function(){return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,"")}),"undefined"!=typeof exports?"undefined"!=typeof module&&module.exports?exports=module.exports=new eFTL:exports=new eFTL:(this.eFTL=new eFTL,this.eFTLMessage=eFTLMessage)}();