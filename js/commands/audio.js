var library = library || {};
var lexi = lexi || {};

function sound(rawSoundName, volume, loops) {
    var soundName = cleanAssetName(rawSoundName);

    
    if (!library.loadedSounds_[soundName]) {
        if (lexi.sounds[soundName]) {
            var volumeSetting = volume === undefined ? 100 : volume;
            var loopsSetting = loops === undefined ? 1 : loops;
            library.loadSound_(soundName, lexi.sounds[soundName],
                volumeSetting, loopsSetting);
        } else {
            if (library.onAssetLoadError_) {
                library.onAssetLoadError_(soundName, 'sound');
            }
            console.warn('Can\'t play ' + soundName + '.');
        }
        return;
    }

    var settings = {};
    settings.volume = 100;
    if (volume) {
        settings.volume = volume;
    }
    if (loops) {
        settings.loops = loops;
    }
    library.loadedSounds_[soundName].play(settings);
}


function song(rawSoundName, volume) {
    var soundName = cleanAssetName(rawSoundName);

    
    if (!library.loadedSounds_[soundName]) {
        if (lexi.songs[soundName]) {
            var volumeSetting = volume === undefined ? 33 : volume;
            var loopsSetting = 99999;
            library.loadSound_(soundName, lexi.songs[soundName],
                volumeSetting, loopsSetting);
        } else {
            if (library.onAssetLoadError_) {
                library.onAssetLoadError_(soundName, 'song');
            }
            console.warn('Can\'t play ' + soundName + '.');
        }
        return;
    }
    
    var vol = 33;
    if (volume !== undefined) {
        vol = volume;
    }
    var settings = {
        'loops': 99999,
        'volume': vol
    };
    library.loadedSounds_[soundName].stop();
    library.loadedSounds_[soundName].play(settings);
}