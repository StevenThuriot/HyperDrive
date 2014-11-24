var cluster = require('cluster');
var workers = process.env.WORKERS || require('os').cpus().length;

if (cluster.isMaster) {

    console.log('Starting hypercluster with %s workers.', workers);

    for (var i = 0; i < workers; ++i) {
        var worker = cluster.fork().process;
        console.log('Worker %s started.', worker.pid);
    }

    cluster.on('exit', function (worker) {
        console.log('Worker %s died. Restarting...', worker.process.pid);
        cluster.fork();
    });

} else {

    var hyperDrive = require('./lib/server');
    hyperDrive();

}

process.on('uncaughtException ', function (err) {
    console.error((new Date).toUTCString() + 'uncaughtException: ', err.message)
    console.error(err.stack)
    process.exit(1)
})