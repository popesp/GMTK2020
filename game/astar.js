function makegraph(level, tilegroups)
{
	const nodes = level.tiles.map(function(row, index_row)
	{
		return row.map(function(tile, index_col)
		{
			if(tilegroups[tile] === 'below')
				return {
					index_row,
					index_col,
					paths: []
				};
			return null;
		});
	});

	nodes.forEach(function(row)
	{
		row.forEach(function(node)
		{
			if(node === null)
				return;

			const nodes_adjacent = [];
			if(node.index_row > 0 && nodes[node.index_row - 1][node.index_col] !== null)
				nodes_adjacent.push(nodes[node.index_row - 1][node.index_col]);
			if(node.index_row < nodes.length - 1 && nodes[node.index_row + 1][node.index_col] !== null)
				nodes_adjacent.push(nodes[node.index_row + 1][node.index_col]);
			if(node.index_col > 0 && nodes[node.index_row][node.index_col - 1] !== null)
				nodes_adjacent.push(nodes[node.index_row][node.index_col - 1]);
			if(node.index_col < row.length - 1 && nodes[node.index_row][node.index_col + 1] !== null)
				nodes_adjacent.push(nodes[node.index_row][node.index_col + 1]);

			nodes_adjacent.forEach(function(node_adjacent)
			{
				if(node_adjacent !== null)
					node.paths.push(node_adjacent);
			});
		});
	});

	return nodes;
}