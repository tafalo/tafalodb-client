const url = require('url');
const axios = require('axios').default;
var PROTO_PATH = __dirname + 'db.proto';
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');




class ReadData {

    #__kw = [];
    #__kf = [];
    #__token = "";
    #__typeObj = new Set(["[object Array]", "[object Object]"]);
    #__host = "";
    #__port = "";
    #__packageDefinition = protoLoader.loadSync(
        PROTO_PATH,
        {
          keepCase: true,
          longs: String,
          enums: String,
          defaults: true,
          oneofs: true
        });
     #__clientProto = null;
    constructor() {
     this.#__clientProto = grpc.loadPackageDefinition(this.#__packageDefinition);
    }
    get token() {
        return this.#__token;
    }
    set token(v) {
        this.#__token = v;
    }
    connectDB(urlConnect, callback) {
        const parsedUrl = url.parse(urlConnect);
        const protocol = parsedUrl.protocol.replace(':', ''); // Lấy giao thức, ví dụ: "tafalodb"
        const username = parsedUrl.auth.split(':')[0]; // Lấy username
        const password = parsedUrl.auth.split(':')[1]; // Lấy password
        const databaseName = parsedUrl.pathname.replace('/', '');
        this.#__host = parsedUrl.hostname; // Lấy hostname
        this.#__port = parsedUrl.port; // Lấy port
        if(!/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/g.test(parsedUrl.hostname)) {
            (typeof callback == 'function') && callback({result: false, client: null, msg: "Host không hơp lệ"});
            return;
        }
        if(!/^((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-5]{0,5})|([0-9]{1,4}))$/g.test(parsedUrl.port)) {
            (typeof callback == 'function') && callback({result: false, client: null, msg: "Port không hợp"});
            return;
        }

        if (protocol === 'tafalodb') {
            // Load từ khoá tại đây, và sẽ sinh ra token tại đây
            this.#postJson("connectDB",{
                protocol,  username, password, databaseName
            }, async (rs) => {
                if(rs.result) {
                    this.token = rs.token;
                   await this.#loadData();
                    (typeof callback == 'function') && callback({
                        result: true, 
                        client: {
                            getTables: this.#getAllTable,
                            find: this.#findData,
                            insertOne: this.#insertOne,
                            update: this.#updateData,
                            delete: this.#deleteData
                        },
                        msg: "Kết nối thành công"});
                } else {
                    (typeof callback == 'function') && callback({result: false, client: null, msg: "Kết nối thất bại"});
                }
            })
            
        } else {
            (typeof callback == 'function') && callback({result: false, client: null, msg: "Cấu trúc không hợp lệ"});
        }
    }
    #strToObj(str){
        try {
           return JSON.parse(str); 
        } catch (error) {
            return null;
        }
    }
    /* get */
    async #loadData() {
       return Promise(resolve => {
        this.#postJson( "loadInit",{query: ""}, (d) => {
            if (d.result) {
                var dd = d.data || {};
                this.#__kf = dd.f || [];
                this.#__kw = dd.w || [];
                this.#__load = true;
                resolve(true);
            } else {
                resolve(false);
            }
        });

        
       }) 
       

    }
    
    async #postJson(url, data, callback) {
       
        var client = new this.#__clientProto.QueryService(`${this.#__host}:${this.#__port}`, grpc.credentials.createInsecure(), {
            "grpc.max_receive_message_length": 2 ** 32,
            "grpc.max_send_message_length": 2 ** 32
          });
          client[url](data, function (err, response) {
            if (err) {
             callback({ result: false, msg: err.message });
            } else {
              if (response.result) {
                callback(this.#strToObj(response.data) || {})
              } else {
                callback({ result: false, msg: response.msg });
              }
        
            }
        
          });
    }

    get kF() {
        var self = this;
        var kf = self.#__kf || [];

        return {
            loadkF(v) {
                return self.#__kf = v;
            },
            getF() {
                return kf;
            },
            get(k) {

                return kf[k];

            },
            value(v) {
                return kf.indexOf(v);
            },


            tB2F(b) {
                return this.get(b[0]);

            }



        }
    }
    get TYPE_OBJECT() {
        return this.#__typeObj;
    }
    get kW() {
        var self = this;
        var kw = self.#__kw;
        return {
            loadkW(v) {
                return self.#__kw = v;
            },
            getW() {
                return kw;
            },
            get(k) {
                return kw[k];

            },
            value(v) {
                return kw.indexOf(v);
            },


            tB2W(vv) {
                let kq = vv.map(m => this.get(m[0]));
                if (kq.length == 1) { return kq[0]; }
                kq = kq.join(" ")
                    .replace(/\s{1,1}[`~\!\@\#\$\%\^\&\*\(\)\-\_\+\=\{\}\[\]\|\\\;\:\'\"\<\,\>\.\?\/]\s{1,1}/g, (m) => m.trim());
                return kq;


            }
        }
    }

    #checkRenIsValue(r) {
        if (Array.isArray(r) && r.every(e => Array.isArray(e) && e.length == 1 && typeof e[0] == 'number')) {
            return true;
        }
        return false;
    }
    #checkRenIsArray(r) {
        if (Array.isArray(r) && r.every(r1 => Array.isArray(r1) && r1.every(e => Array.isArray(e)))) {
            return true;
        }
        return false;
    }

    #revRenObj(a) {
        if (!Array.isArray(a)) {
            return null;
        }
        var isArray = this.#checkRenIsArray(a);
        var o = isArray ? [] : {};
        if (isArray) {
            a.forEach(f => {
                var checkF = this.#checkRenIsValue(f);
                if (!checkF) {
                    o.push(this.#revRenObj(f));
                } else {
                    var vv = this.kW.tB2W(f);
                    o.push(vv);
                }

            });
        } else {
            for (var i = 0; i < a.length; i = i + 2) {
                var k = a[i];
                var kv = this.kF.tB2F(k);
                var v = a[i + 1];
                var checkV = this.#checkRenIsValue(v);
                if (!checkV) {
                    o[kv] = this.#revRenObj(v);
                } else {

                    var vv = this.kW.tB2W(v);
                    o[kv] = vv;
                }
            }
        }


        return o;
    }
    #read(a) {
        return this.#revRenObj(a);
    }

    async #callback(d, callback) {
        console.log()
        if (d && (d.f || d.w)) {
            // load dữ liệu
            await this.#loadData();

        }
        delete d.f;
        delete d.w;
        if (d.result && d.data) {
            if (Array.isArray(d.data)) {
                d.data = d.data.map(m => this.#read(m));
            } else if (Array.isArray(d.data.rows)) {
                d.data.rows = d.data.rows.map(m => this.#read(m));
            } else {
                if (typeof d.data == 'object') {
                    Object.keys(d.data).forEach(f => {
                        if (Array.isArray(d.data[f])) {
                            d.data[f] = this.revRenObj(d.data[f]);
                        }
                    });
                }
            }



        }
        (typeof callback == 'function') && callback(d);
    }

    #getAllTable(callback) {
        if(!this.token) {
            (typeof callback == 'function') && callback({result: false, msg: "Lỗi kết nối db"});
            return;
        }
        this.postJson("getAllTable", {query: ""}, callback);
    }
    #findData(filter, callback) {
        if(!this.token) {
            (typeof callback == 'function') && callback({result: false, msg: "Lỗi kết nối db"});
            return;
        }
        this.postJson("find", {query: JSON.stringify(filter)}, async d => {
            await this.#callback(d, callback)
        })
    }
    //obj = {table: tên bảng, data: đối tượng cần thêm}
    #insertOne(obj, callback) {
        if(!this.token) {
            (typeof callback == 'function') && callback({result: false, msg: "Lỗi kết nối db"});
            return;
        }
        if (obj && obj.data) {
            this.postJson("insertOne", {query: JSON.stringify(obj)}, async d => {
                await this.#callback(d, callback)
            })
        } else {
            (typeof callback == 'function') && callback({ result: false, msg: 'Dữ liệu chèn không hợp lệ' })
        }



    }

    // filter: áp dụng luật filter, nếu page = 1, rows = 1 thì sẽ update một bản ghi tính từ trang đầu tiên.
    // obj: Là đối tượng cần chỉnh sửa.
    #updateData(filter, obj, callback) {
        if(!this.token) {
            (typeof callback == 'function') && callback({result: false, msg: "Lỗi kết nối db"});
            return;
        }
        this.postJson("updateMany", {query: JSON.stringify({ filter, data: obj })}, async d => {
            await this.#callback(d, callback);
        })
    }
    // filter: áp dụng luật filter, nếu page = 1, rows = 1 thì sẽ update một bản ghi tính từ trang đầu tiên.
    #deleteData(filter, callback) {
        if(!this.token) {
            (typeof callback == 'function') && callback({result: false, msg: "Lỗi kết nối db"});
            return;
        }
        this.postJson("deleteMany", { query: JSON.stringify(filter) }, async d => {
            await this.#callback(d, callback);
        })
    }
}

module.exports = new ReadData();