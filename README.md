# Roblox Player Manager

This project has been developed by h1dr4x

## Usage

Roblox Player Manager is a very simple program to manage servers & players of your Roblox game using a Discord bot or an API.

The API that the roblox game will be in touch is located at index.js file, it runs at port 3000. In order to run this project you have to host it on your own. (just run cmd node index.js lol)

To run the bot replace token and your_url with your API URL and then run command node bot.js.

One last step, you know the game wont connect to the API by itself so i have made a pretty simple code for you guys.

```lua
local HttpService = game:GetService("HttpService")
local RunService = game:GetService("RunService")
local delaySec = 3
local URL = "https://your_url"
local jobID = game.JobId
print(jobID)
function post(url,data)
	local success,response = pcall(function()
		return HttpService:PostAsync(url,HttpService:JSONEncode(data),Enum.HttpContentType.ApplicationJson,true)
	end)
	if success then
		return HttpService:JSONDecode(response)
	else
		print("[HttpService] Error sending a post request: ",response)
	end
end

function get(url)
	local success,response = pcall(function()
		return HttpService:GetAsync(url)
	end)
	if success then
		return HttpService:JSONDecode(response)
	else
		print("[HttpService] Error sending a get request: ",response)
	end
end

function getPlayers()
	local players = {}
	for i,v in pairs(game.Players:GetPlayers()) do
		local player = {
			userID = v.UserId,
			username = v.Name,
			displayName = v.DisplayName,
		}
		players[player.username] = player
	end
	return players
end

function getKickRequests()
	local endpoint = "/servers/" .. jobID .. "/kick-requests"
	local res = get(URL .. endpoint)
	if not res then
		return nil
	end
	if res["error"] then
		if res["error"] == "No kick requests found." then
			return nil
		end
	end
	return res
end

function deleteKickRequestFromServer(username)
	local endpoint = "/servers/" .. jobID .. "/players/" .. username .. "/kick/accept"
	local res = post(URL .. endpoint,{})
	if not res then
		return nil
	end
	return res
end

game.Players.PlayerAdded:Connect(function()
	local players = getPlayers()
	local postData = {
		["players"] = players
	}
	local endpoint = "/servers/" .. jobID
	local sendReq = post(URL .. endpoint,postData)
end)

game.Players.PlayerRemoving:Connect(function()
	local players = getPlayers()
	local postData = {
		["players"] = players
	}
	local endpoint = "/servers/" .. jobID
	local sendReq = post(URL .. endpoint,postData)
end)

game:BindToClose(function()
	local endpoint = "/servers/" .. jobID .. "/disconnect"
	local sendReq = post(URL .. endpoint,{})
	if not sendReq then
		return
	end
	if sendReq["success"] == true then
		print("[INFO] Server has been disconnected successfully.")
	end
end)

coroutine.wrap(function()
	while true do
		wait(delaySec)
		local kickRequests = getKickRequests()
		local players = getPlayers()
		for i,v in pairs(players) do
			if kickRequests then
				if not kickRequests[v.username] then
					return
				end
				game.Players:GetPlayerByUserId(v.userID):Kick(kickRequests[v.username])
				local delete = deleteKickRequestFromServer(v.username)
				if delete["success"] == true then
					print("[INFO] " .. v.username .. " has been kicked! (".. kickRequests[v.username] .. ")")
				end
			end
		end
	end
end)()
```

Put this code in ServerScriptService and all should be good!

## Bot Commands

!servers - Shows a list of servers.\
!players serverID - Show a list of players at a specific server.\
!kick serverID username - Kick a player from a server
