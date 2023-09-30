import * as every from "@minecraft/server"
import * as ui from "@minecraft/server-ui"

//made by CTabdul15
every.world.beforeEvents.chatSend.subscribe(data => {
    let { message: msg, sender: player } = data

    if (msg.startsWith('!') && player.isOp() == true) {
        data.cancel = true
        every.system.run(() => {
            switch (msg.toLowerCase()) {
                case "!":
                    player.sendMessage("§aWorking!")
                    break
                case "!help":
                case "!h":
                case "!?":
                    player.sendMessage(`§a-=-=-=-=-=§6 Command List §a=-=-=-=-\n§a!start §d- Starts the timer\n§a!change §d- Changes player size timer\n§a!reset §d- Resets everything\n§a!help §d- Displays a list of commands`)
                    player.playSound("random.orb")
                    break
                case "!start":
                    player.runCommandAsync("function start")
                    break
                case "!chg":
                case "!change":
                case "!c":
                    player.playSound("random.pop")
                    const form = new ui.ModalFormData()
                    let value2 = getScore("timer", "timer")
                    console.warn(value2)
                            if (value2 == 0) {
                                form.title(`§2size change time is: §g${getScore("timer", "timer") +1}§2 minute(s)`)
                                form.textField(`§cIf you want to change the value please write in the chat !reset and than do it\n§aEnter here your minutes example:\n10 = 10 Minutes, every 10 minutes the player size changes.\n\n§asize change time is: §g${getScore("timer", "timer") +1}§a minute(s)`, "Enter a value for example 1 or 10", "1")
                            } else {
                                form.title(`§2size change time is: §g${getScore("timer", "timer")}§2 minute(s)`)
                                form.textField(`§cIf you want to change the value please write in the chat !reset and than do it\n§aEnter here your minutes example:\n10 = 10 Minutes, every 10 minutes the player size changes.\n\n§asize change time is: §g${getScore("timer", "timer")}§a minute(s)`, "Enter a value for example 1 or 10", "1")
                            }
                        ForceOpen(player, form).then(result => {
                            if (result.canceled == true) return
                            const value = parseFloat(result.formValues[0]);
                            if (isNaN(value)) return player.sendMessage("§cIt's not a value"), player.playSound("random.glass")
                            if (!isNaN(value)) {
                                player.runCommandAsync("scoreboard players set timer timer " + value)
                                player.sendMessage("§aTimer has been changed to §g" + value + "§a. Type now !start in the chat")
                            }
                        })
                    break
                case "!reset":
                case "!rst":
                case "!r":
                    player.runCommandAsync("function reset")
                    for (let i in every.world.getPlayers()) {
                        let ok = 0.90
                        every.world.getPlayers()[i].getComponent("minecraft:scale").value = ok
                    }
                    player.playSound("random.toast")
                    break
                default: player.sendMessage(`§cTrying to find a command? Type !help for a list of all commands.`), player.playSound("random.glass")
            }
        })
    } else if (msg.startsWith('!') && player.isOp() == false) {
        every.system.run(() => {
            player.sendMessage(`§cYou are not allowed to do that!.`), player.playSound("random.glass")
        })
    }
})
async function ForceOpen(player, form) {
    while (true) {
        const response = await form.show(player);
        if (response.cancelationReason !== "UserBusy") return response;
    }
}

every.world.afterEvents.playerSpawn.subscribe(data => {
    let { player, initialSpawn } = data;
    if (!initialSpawn) return
    const scaleValue = getFakePlayer("scale")
    const parsedScaleValue = parseFloat(scaleValue);
    let ok = every.system.runInterval(() => {
        if (!isNaN(parsedScaleValue)) {
            player.getComponent("minecraft:scale").value = parsedScaleValue
        } else {
            //console.warn(`Invalid scale value: ${scaleValue}`);
        }
        every.system.clearRun(ok);
    }, 40)
});



//let ok1 = every.system.runInterval(() => {
//    [...every.world.getPlayers()].forEach(player => {
//        player.getComponent("minecraft:scale").value = size = 0.90
//        player.runCommand("scoreboard players set start start 0")
//        player.runCommand("scoreboard players reset timer timer")
//        player.runCommand("scoreboard players reset * time")
//        player.runCommand("scoreboard players add time time 0")
//        player.runCommand("scoreboard players set timer timer 1")
//    })
//    every.system.clearRun(ok1);
//}, 20)

every.system.runInterval(() => {
    if (every.world.scoreboard.getObjective("start").getScore("start") >= 1) {
        addScore("time", "time", 1);
    }
},20)

every.system.runInterval(() => {
    if (every.world.scoreboard.getObjective("start").getScore("start") >= 1) {
        updateTimer()
    }
})



let previousMinute = -1;
let value = getScore("timer", "timer")
function updateTimer() {
    for (let player of every.world.getPlayers()) {
        const score = every.world.scoreboard.getObjective("time").getScore("time")
        if (score !== null) {
            const timeInSeconds = score;
            const formattedTime = formatTime(timeInSeconds);
            player.onScreenDisplay.setActionBar(`§a${formattedTime} | size: ${toFixed(player.getComponent("minecraft:scale").value)}`);
            const currentMinute = Math.floor(timeInSeconds / 60)
            if (every.world.scoreboard.getObjective("start").getScore("start") >= 1) {
                if (currentMinute !== previousMinute) {
                    previousMinute = currentMinute;
                    if (value == 0) {
                        if ((Math.floor(timeInSeconds) / 60) === currentMinute) {
                            value += getScore("timer", "timer")
                            for (let i in every.world.getPlayers()) {
                                let ok = every.world.getPlayers()[i].getComponent("minecraft:scale").value += 0.1
                                every.world.getDimension("overworld").runCommandAsync(`scoreboard players reset * scale`)
                                every.world.getDimension("overworld").runCommandAsync(`scoreboard players set "${ok.toFixed(2)}" scale 0`)
                                player.runCommandAsync("playsound random.levelup @a")
                            }
                        }
                    }
                    else {
                        if ((value * 60) === Math.floor(timeInSeconds)) {
                            value += getScore("timer", "timer");
                            for (let i in every.world.getPlayers()) {
                                let ok = every.world.getPlayers()[i].getComponent("minecraft:scale").value += 0.1
                                every.world.getDimension("overworld").runCommandAsync(`scoreboard players reset * scale`)
                                every.world.getDimension("overworld").runCommandAsync(`scoreboard players set "${ok.toFixed(2)}" scale 0`)
                                player.runCommandAsync("playsound random.levelup @a")
                            }
                        }
                    }
                }
            }
        }
    }
}

function toFixed(value) {
    value = value
    return value.toFixed(2)
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const remainingSeconds = seconds % 3600;

    const formattedHours = hours.toString().padStart(2, "0");
    const formattedMinutes = Math.floor(remainingSeconds / 60).toString().padStart(2, "0");
    const formattedSeconds = (remainingSeconds % 60).toString().padStart(2, "0");

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

function addScore(scoreboardValue, player, number) {
    try {
        const newScore = every.world.scoreboard.getObjective(scoreboardValue).getScore(player) + number;
        return every.world.scoreboard.getObjective(scoreboardValue).setScore(player, newScore)
    } catch {
        return 0
    }
}


function getScore(scoreboard, player) {
    
        try {
            return every.world.scoreboard.getObjective(scoreboard).getScore(player)
        } catch (e) {
            return 0
        }
    
}

function getFakePlayer(objectiveId) {
    const participants = every.world
        .scoreboard.getObjective(objectiveId)
        .getParticipants()
        .filter(data => data.type === every.ScoreboardIdentityType.FakePlayer)
        .map(x => x.displayName);

    return participants.length > 0 ? participants[0] : 0.90;
}
