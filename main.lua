function dump(o)
   if type(o) == 'table' then
      local s = '{ '
      for k,v in pairs(o) do
         if type(k) ~= 'number' then k = '"'..k..'"' end
         s = s .. '['..k..'] = ' .. dump(v) .. ', '
      end
      return s .. '} '
   else
      return tostring(o)
   end
end

function double_quote(str)
    return string.format('%q', str)
end

function concat_array(array)
    local out = array[1]
    -- print("slice: " .. dump({ unpack(array, 2) }))
    -- print("initial: " .. dump({ unpack(array, 2) }))
    for _, k in ipairs({ unpack(array, 2) }) do
        out = out .. " " .. k
    end
    return out
end



local yaml = require('lyaml')
local file = io.open("config.yaml", "r")
local content = file:read("*all")
file:close()

local data = yaml.load(content)

local parse_env = function(data)
    output = {}

    -- print(type(data))
    -- print(data)
    for index, env in ipairs(data) do
        -- print(index .. ": " .. env.name)

        if env.name == nil then
            print('You must specify a name for env, ignoring')
        elseif env.value ~= nil and env.default ~= nil then
            print('Cannot specify value and default at the same time, ignoring')
        else
            local val
            if env.value ~= nil then
                -- val = string.format('%q', env.value)
                val = double_quote(env.value)
            elseif env.default ~= nil then
                -- print(string.format('%q', env.default))
                val = string.format('"${%s:-%s}"', env.name, env.default)
            else
                val = string.format('"$%s"', env.name, env.default)
            end
            -- print(dump(env))
            -- print(env.name .. " " .. val)

            output[env.name] = {'setenv', env.name, val}
        end
    end

    -- print(dump(output))
    return output
end

env = parse_env(data.env)

for _, v in pairs(env) do
    -- print("v: " .. dump(v))
    print(concat_array(v))
end

print()
for k,v in pairs(data.database) do
  print(k .. ": " .. v)
end



