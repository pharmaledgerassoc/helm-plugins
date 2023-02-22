function portForward(config, callback) {
    const childProcess = require("child_process");

    if (typeof config.namespace === "undefined") {
        config.namespace = "default";
    }
    let child;
    if (typeof config.fullnameOverride !== "undefined") {
        child = childProcess.spawn("kubectl", ["port-forward", `--namespace=${config.namespace}`, `deployment/${config.fullnameOverride}`, `8545:8545`], {detached: true});
    } else if (typeof config.pod_name !== "undefined") {
        child = childProcess.spawn("kubectl", ["port-forward", `--namespace=${config.namespace}`, `${config.pod_name}`, `8545:8545`], {detached: true});
    } else {
        throw Error("Missing deployment.fullnameOverride and pod_name from config");
    }

    child.stdout.once("data", (data) => {
        callback(undefined, child);
    })

    child.stderr.on("data", (data) => {
        callback(data.toString())
    })
}

module.exports = {
    portForward
}