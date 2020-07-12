const fs = require('fs');
const { parse } = require('path');


const TILE_SET_WIDTH = 512/16;

fs.readFile('game/assets/tileset.json', 'utf8', function(err, data)
{
    if(err)
        console.log(err);

    const tileset = JSON.parse(data);

    const level = {
        name: 'level0',
        spawn: [7, 2]
    }

    const tile_bottom = 'level0_Tile Layer 1.csv';
    const tile_top = 'level0_Tile Layer 2.csv';

    const file_promises = [];
    file_promises.push(new Promise(function(resolve, reject){
        fs.readFile(`game/assets/levels/${tile_bottom}`, 'utf8', function (err,data) {
            if(err)
                reject(err);
            
            resolve(data);
        });
    }));

    file_promises.push(new Promise(function(resolve, reject){
        fs.readFile(`game/assets/levels/${tile_top}`, 'utf8', function (err,data) {
            if(err)
                reject(err);
            
            resolve(data);
        });
    }));

    const parse_layer = function(data)
    {
        const ret = [];
        const lines = data.split('\n');
        for(let i = 0; i < lines.length - 1; ++i)
        {
            ret[i] = [];
            const current_row = ret[i];
            const split = lines[i].split(',');
            for(let i = 0; i < split.length; ++i)
            {
                let index_into_file = parseInt(split[i]);
                if(index_into_file === -1)
                    index_into_file = 0;

                let row = Math.floor(index_into_file/TILE_SET_WIDTH);
                let y = row * 16;
                let x = (index_into_file - (row * TILE_SET_WIDTH)) * 16;

                let filename;
                for(let i = 0; i < tileset.frames.length; ++i)
                {
                    const frame = tileset.frames[i];
                    if(x === frame.frame.x && y === frame.frame.y)
                        filename = frame.filename;
                }

                current_row[i] = filename;
            }
        }

        return ret;
    }

    Promise.all(file_promises).then(function(files)
    {
        level.tiles = parse_layer(files[0]);
        level.tiles_top = parse_layer(files[1]);

        fs.writeFile(`${level.name}_parsed.json`, JSON.stringify(level), function (err){
            if(err)
                console.log('Ya done goofed');
            else
                console.log('Level Parsed');
        });
    });
});
