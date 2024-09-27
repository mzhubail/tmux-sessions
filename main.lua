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

function whitespace(length) 
    local t = {}
    for _ = 1, length do
        t[#t + 1] = ' '
    end
    return table.concat(t)
end

function err(str)
    io.write('\27[31mERR:\27[0m ')
    io.write(str)
    io.write('\n')

--     io.write('\27[31m')
--     io.write(str)
--     io.write('\27[0m\n')
end


local yaml = require('lyaml')
local file = io.open("sample.yaml", "r")
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
            err('You must specify a name for env, ignoring')
        elseif env.value ~= nil and env.default ~= nil then
            err('Cannot specify value and default at the same time, ignoring')
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

            output[index] = {'setenv', env.name, val}
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
        elseif props.split ~= nil then
            if props.split.upperside == nil and props.split.lowerside == nil and
                props.split.leftside == nil and props.split.rightside == nil then
                err('err')
            else
                -- Detect split direction
                local first_side, second_side, split_command
                if props.split.upperside ~= nil and props.split.lowerside ~= nil then
                    first_side  = props.split.upperside
                    second_side = props.split.lowerside
                    split_command = { 'split-window', '-v' }
                elseif props.split.leftside ~= nil and props.split.rightside ~= nil then
                    first_side  = props.split.leftside
                    second_side = props.split.rightside
                    split_command = { 'split-window', '-h' }
                end


                -- print("split: " .. dump(props))

                -- parse_windows({ rightside, leftside })

                local first_cmds  = parse_windows({ first_side })
                local second_cmds = parse_windows({ second_side })
                -- print("left: " .. dump(left))

                -- print("before: " .. dump(output))
                table_concat(
                    output,
                    {
                        unpack(first_cmds),
                        split_command,
                        unpack(second_cmds)
                    }
                    )
                -- print("after: " .. dump(output))
            end

        -- Err
        else
            err('Unrecognized window structure, ignoring')
        end
    end

    return output
end

main = function()
    local env       = parse_env(data.env)
    local windows   = parse_windows(data.windows)
    local cmds      = { unpack(env) }
    table_concat(cmds, windows)

    -- print("      >> env:     " .. dump(env))
    -- print("      >> windows: " .. dump(windows))
    -- print("      >> cmds:    " .. dump(cmds))

    print('\ntmux \\')
    for i, cmd in ipairs(cmds) do
        cmds[i] = table.concat(cmd, ' ') .. ' \\;'

        io.write('  ' .. cmds[i] .. whitespace(60 - #cmds[i]))
        if i ~= #cmds then
            io.write('\\\n')
        else
            io.write('\n')
        end
    end

    io.write('\n\nrun command? (yes / no): ')
    local input = io.read()
    -- print(input)

    if input ~= 'yes' and input ~= 'y' then
        return
    end

    -- for i, cmd in ipairs(cmds)

    os.execute(table.concat(
        { 'tmux ', unpack(cmds) },
        ' '
    ))
end

main()

-- print()
-- for k,v in pairs(data.database) do
--     print(k .. ": " .. v)
-- end


-- print(if true then "a" else "b" end)
