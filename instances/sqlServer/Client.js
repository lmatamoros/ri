// ----------------------------------------------------------------//
//            Cliente para consumo de SPs en SQL Server            //
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

const sql = require("mssql")

var SqlServerClient = () => {}

SqlServerClient.prototype.connect = (config) => {
    return new Promise((resolve, reject) => {
        new sql.ConnectionPool(config).connect().then(pool => {
            resolve(pool)
        }).catch(err => {
            reject(err)
        })
    })
}

SqlServerClient.instance = null

SqlServerClient.getInstance = () => {
    if (this.instance === null) {
        this.instance = new SqlServerClient()
    }
    return this.instance
}

module.exports = SqlServerClient.getInstance()
