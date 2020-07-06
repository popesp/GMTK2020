build=builds/$(date "+%Y-%m-%d-%H%M%S").tar.gz
tar -s /phaser.min.js/phaser.js/ --exclude-from .bundleignore -czf $build --directory game .
echo Build created: $build