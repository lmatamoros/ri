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

const SPConsumer = require("./instances/sqlServer/SPConsumer")

var DBConsumer = (type, config) => {
    let spConsumer
    if (type === "SQLSERVER") {
        spConsumer = new SPConsumer(config)
    } else if (type === "ORACLE") {
        throw new Error("ORACLE NotImplementedException")
    } else if (type === "MYSQL") {
        throw new Error("MYSQL NotImplementedException")
    } else {
        throw new Error("Illegal database type")
    }
    this._spConsumer = spConsumer
}

DBConsumer.prototype.callSP = (spName, spArgs) => {
    let self = this
    return new Promise((resolve, reject) => {
        self._spConsumer.execute(spName, spArgs).then(result => {
            resolve(result)
        }).catch(err => {
            reject(err)
        })
    })
}

module.exports = DBConsumer
