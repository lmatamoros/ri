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

var SqlSPConsumer = (config) => {
    this._config = config
    this.client = null
}

SqlSPConsumer.prototype.execute = (spName, spArgs) => {
    let self = this
    return new Promise((resolve, reject) => {
        if (self.client === null) {
            client.connect(self._config).then(pool => {
                self.client = pool
                return self.request(spName, spArgs)
            }).then(result => {
                resolve(result)
            }).catch(err => {
                reject(err)
            })
        } else {
            self.request(spName, spArgs).then(result => {
                resolve(result)
            }).catch(err => {
                reject(err)
            })
        }
    })
}

SqlSPConsumer.prototype.request = (spName, spArgs) => {
    let self = this
    return new Promise((resolve, reject) => {
        try {
            let spRequest = self.client.request()
            self.setParams(spRequest, spArgs)
            spRequest.execute(spName, (err, recordsets, returnValue) => {
                if (err) {
                    let error = {
                        error: err,
                        code: 500
                    }
                    reject(error)
                } else {
                    let result = {
                        recordsets: self.resultSet(recordsets),
                        returnValue: returnValue,
                        code: 200
                    }
                    resolve(result)
                }
            })
        } catch (exc) {
            let err = {
                error: exc.toString(),
                code: 501
            }
            reject(err)
        }
    })
}

SqlSPConsumer.prototype.setParams = (spRequest, spArgs) => {
    let self = this
    for (let param in spArgs) {
        spRequest.input(param, self.paramType(spArgs[param]), spArgs[param].value)
    }
}

SqlSPConsumer.prototype.paramType = (param) => {
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

SqlSPConsumer.prototype.resultSet = (recordsets) => {
    return (recordsets && "recordsets" in recordsets) 
        ? (recordsets["recordsets"].length > 0 ? recordsets["recordsets"][0] : [])
        : []
}

module.exports = SqlSPConsumer
