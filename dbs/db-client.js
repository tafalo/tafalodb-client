//https://github.com/FightLightDiamond/aoerandom/blob/master/package.json
const url = require('url');
const axiosRe = require('axios')

class ReadData {

    #__kw = [];
    #__kf = [];
    #__token = "";
    #__typeObj = new Set(["[object Array]", "[object Object]"]);
    #__load = false;
    #__domain = "";
    constructor() {
        this.axios = new axiosRe.Axios();
    }
    get domain2() {
        return this.#__domain;
    }
    get token() {
        return this.#__token;
    }
    connectDB(urlConnect) {
        const parsedUrl = url.parse(urlConnect);
        const protocol = parsedUrl.protocol.replace(':', ''); // Lấy giao thức, ví dụ: "tafalodb"
        const username = parsedUrl.auth.split(':')[0]; // Lấy username
        const password = parsedUrl.auth.split(':')[1]; // Lấy password
        const hostname = parsedUrl.hostname; // Lấy hostname
        const port = parsedUrl.port; // Lấy port
        const databaseName = parsedUrl.pathname.replace('/', '');
        this.#__domain = 'https://' + hostname + ":" + port;
        if (protocol === 'tafalodb') {
            // Load từ khoá tại đây, và sẽ sinh ra token tại đây
            console.log("ok");
            return true;
        } else {
            console.log("false");
            return false;
        }
    }
    renUrl(url) {
        if (url[0] == '/') {
            return this.domain2 + url;
        } else {
            return this.domain2 + "/" + url;
        }
    }
    /* get */
    async loadData() {
        var d = await this.postJson("/load-init", {});

        if (d.result) {
            var dd = d.data || {};
            this.#__kf = dd.f || [];
            this.#__kw = dd.w || [];
            this.#__load = true;
        }
        return true;
    }
    get isLoad() {
        return this.#__load;
    }
    async postJson(url, data, callback) {
        try {
            var res = await this.axios.post(this.renUrl(url), data, {
                headers: {
                    "Content-Type": "application/json",
                    "token": this.#__token
                }
            })
            if (res.statusText == "OK") {
                var rjs = res.data;
                (typeof callback == 'function') && callback(rjs);
                return rjs;
            }

            var rr = { result: false, code: 204, msg: response.statusText };
            (typeof callback == 'function') && callback(rr);
            return rr;
        } catch (error) {
            console.log(error);
            var rr = { result: false, code: 204, msg: "Liên hệ với kỹ thuật" };
            (typeof callback == 'function') && callback(rr);
            return rr;
        }
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

    checkRenIsValue(r) {
        if (Array.isArray(r) && r.every(e => Array.isArray(e) && e.length == 1 && typeof e[0] == 'number')) {
            return true;
        }
        return false;
    }
    checkRenIsArray(r) {
        if (Array.isArray(r) && r.every(r1 => Array.isArray(r1) && r1.every(e => Array.isArray(e)))) {
            return true;
        }
        return false;
    }

    revRenObj(a) {
        if (!Array.isArray(a)) {
            return null;
        }
        var isArray = this.checkRenIsArray(a);
        var o = isArray ? [] : {};
        if (isArray) {
            a.forEach(f => {
                var checkF = this.checkRenIsValue(f);
                if (!checkF) {
                    o.push(this.revRenObj(f));
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
                var checkV = this.checkRenIsValue(v);
                if (!checkV) {
                    o[kv] = this.revRenObj(v);
                } else {

                    var vv = this.kW.tB2W(v);
                    o[kv] = vv;
                }
            }
        }


        return o;
    }
    read(a) {
        return this.revRenObj(a);
    }

    async callback(d, callback) {
        console.log()
        if (d && (d.f || d.w)) {
            // load dữ liệu
            await this.loadData();

        }
        delete d.f;
        delete d.w;
        if (d.result && d.data) {
            if (Array.isArray(d.data)) {
                d.data = d.data.map(m => this.read(m));
            } else if (Array.isArray(d.data.rows)) {
                d.data.rows = d.data.rows.map(m => this.read(m));
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
    // Get all table
    getAllTable(callback) {
        if(!this.token) {
            (typeof callback == 'function') && callback({result: false, msg: "Lỗi kết nối db"});
            return;
        }
        this.postJson("/get-all-table", {}, callback);
    }
    // filter áp dụng luật filter có bao gồm là bảng
    findData(filter, callback) {
        if(!this.token) {
            (typeof callback == 'function') && callback({result: false, msg: "Lỗi kết nối db"});
            return;
        }
        this.postJson("/select", filter, async d => {
            await this.callback(d, callback)
        })
    }
    //obj = {table: tên bảng, data: đối tượng cần thêm}
    insertData(obj, callback) {
        if(!this.token) {
            (typeof callback == 'function') && callback({result: false, msg: "Lỗi kết nối db"});
            return;
        }
        if (obj && obj.data) {
            this.postJson("/insert", obj, async d => {
                await this.callback(d, callback)
            })
        } else {
            (typeof callback == 'function') && callback({ result: false, msg: 'Dữ liệu chèn không hợp lệ' })
        }



    }

    // filter: áp dụng luật filter, nếu page = 1, rows = 1 thì sẽ update một bản ghi tính từ trang đầu tiên.
    // obj: Là đối tượng cần chỉnh sửa.
    updateData(filter, obj, callback) {
        if(!this.token) {
            (typeof callback == 'function') && callback({result: false, msg: "Lỗi kết nối db"});
            return;
        }
        this.postJson("/update", { filter, data: obj }, async d => {
            await this.callback(d, callback);
        })
    }
    // filter: áp dụng luật filter, nếu page = 1, rows = 1 thì sẽ update một bản ghi tính từ trang đầu tiên.
    deleteData(filter, callback) {
        if(!this.token) {
            (typeof callback == 'function') && callback({result: false, msg: "Lỗi kết nối db"});
            return;
        }
        this.postJson("/delete", { filter }, async d => {
            await this.callback(d, callback);
        })
    }
}

module.exports = new ReadData();