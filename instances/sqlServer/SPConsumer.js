// ----------------------------------------------------------------//
//               Consume sps a partir de la instancia              //
//                  especificada en el constructor                 //
//  @ld.matamoros@gmail.com                                        //
//  Author: Luis Matamoros                                         //
//                                                                 //
// ----------------------------------------------------------------//

/* -----------------------------------------------------------------/
    Date:    17-06-2018
    Author:  Luis Matamoros
    Changes:
       First version 
/----------------------------------------------------------------- */
"use strict"

const client = require("./Client"),
    sql = require("mssql")

var SqlSPConsumer = function (config) {
    this._config = config
    this.client = null
}

SqlSPConsumer.prototype.execute = function (spName, spArgs, callback, resArgs) {
    let self = this
    if (self.client === null) {
        client.connect(self._config).then(pool => {
            self.client = pool
            self.request(spName, spArgs, callback, resArgs)
        }).catch(err => {
            callback(err, null, resArgs)
        })
    } else {
        self.request(spName, spArgs, callback, resArgs)
    }
}

SqlSPConsumer.prototype.request = function (spName, spArgs, callback, resArgs) {
    let self = this
    try {
        let spRequest = self.client.request()
        self.setParams(spRequest, spArgs)
        spRequest.execute(spName, function(err, recordsets, returnValue) {
            if(err) {
                let error = {
                    error: err,
                    code: 500
                }
                callback(error, null, resArgs)
            } else {
                let result = {
                    recordsets: self.resultSet(recordsets),
                    returnValue: returnValue,
                    code: 200
                }
                callback(null, result, resArgs)
            }
        })
    } catch (exc) {
        let err = {
            error: exc.toString(),
            code: 501
        }
        callback(err, null, resArgs)
    }
}

SqlSPConsumer.prototype.setParams = function (spRequest, spArgs) {
    let self = this
    for(let param in spArgs) {
        spRequest.input(param, self.paramType(spArgs[param]), spArgs[param].value)
    }
}

SqlSPConsumer.prototype.paramType = function (param) {
    let self = this
    if (param.type === "VARCHAR") {
        return sql.VarChar(("length" in param ? param.length : sql.MAX))
    } else if (param.type === "NVARCHAR") {
        return sql.NVarChar(param.length)
    } else if (param.type === "INT") {
        return sql.Int
    } else if (param.type === "BIGINT") {
        return sql.BigInt
    } else if (param.type === "TINYINT") {
        return sql.TinyInt
    } else if (param.type === "SMALLINT") {
        return sql.SmallInt
    } else if (param.type === "FLOAT") {
        return sql.Float
    } else if (param.type === "NUMERIC") {
        return sql.Numeric(param.precision, param.scale)
    } else if (param.type === "DECIMAL") {
        return sql.Decimal(param.precision, param.scale)
    } else if (param.type === "DATE") {
        return sql.Date
    } else if (param.type === "DATETIME") {
        return sql.DateTime
    } else if (param.type === "DATETIME2") {
        return sql.DateTime2(param.scale)
    } else if (param.type === "CHAR") {
        return sql.Char
    } else if (param.type === "NText") {
        return sql.NText
    } else if (param.type === "XML") {
        return sql.Xml
    } else if (param.type === "BOOLEAN") {
        return sql.Bit
    } else {
        throw new Error("Illegal param type")
    }
}

SqlSPConsumer.prototype.resultSet = function (recordsets) {
    return (recordsets && "recordsets" in recordsets) 
		? (recordsets["recordsets"].length > 0 ? recordsets["recordsets"][0] : [])
		: []
}

module.exports = SqlSPConsumer
