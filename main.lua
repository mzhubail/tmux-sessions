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

function ternary(predicate, a, b)
    if predicate then return a else return b end
end

function table_concat(t1, t2)
    for i=1, #t2 do
        t1[#t1 + 1] = t2[i]
    end
    return t1
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


parse_windows = function(data)
    local output = {}

    for index, props in pairs(data) do
        if index ~= 1 then
            -- print(dump(output))
            -- print(dump(props))
            table.insert(output, { 'new-window' })
        end

        -- Base case
        if props.cmd ~= nil then
            -- print("cmd: " .. props.cmd)
            local steps

            if props.working_directory ~= nil then
                steps = { "cd " .. props.working_directory }
            else
                steps = {}
            end

            -- steps[#steps + 1] = props.cmd
            table.insert(steps, props.cmd)

            for _, cmd in ipairs(steps) do
                table.insert(output, {
                    'send-keys',
                    string.format('%q', '  ' .. cmd),
                    ternary(props.norun == true, '', 'C-m')
                })
            end


        -- Split screen case
        elseif props.vertical_split ~= nil or props.horizontal_split ~= nil then
            -- print("split: " .. dump(props))

            if props.vertical_split ~= nil then
                local rightside = props.vertical_split.rightside
                local leftside = props.vertical_split.leftside

                if rightside == nil or leftside == nil then
                    print('err')
                else
                    -- parse_windows({ rightside, leftside })

                    -- table_concat(

                    local left = parse_windows({ leftside })
                    local right = parse_windows({ rightside })
                    -- print("left: " .. dump(left))

                    -- print("before: " .. dump(output))
                    table_concat(
                        output,
                        {
                            unpack(left),
                            { 'splitw', '-h' },
                            unpack(right)
                        }
                    )
                    -- print("after: " .. dump(output))
                end
            else
                local upperside = props.horizontal_split.upperside
                local lowerside = props.horizontal_split.lowerside

                if upperside == nil or lowerside == nil then
                    print('err')
                else
                    parse_windows({ upperside, lowerside })
                end
            end

        -- Err
        else
            print('Unrecognized window structure, ignoring')
        end
    end

    return output
end

env = parse_env(data.env)
windows = parse_windows(data.windows)

print()
for _, v in pairs(env) do
    -- print("v: " .. dump(v))
    print(concat_array(v))
end

print()
for k,v in pairs(data.database) do
  print(k .. ": " .. v)
end



