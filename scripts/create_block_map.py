from colorthief import ColorThief
import json
import os

if not os.path.exists("./gen"):
    os.mkdir("gen")

all = []
pixel_backgrounds_only = []
pixel_blocks_only = []

for filename in os.listdir("./assets/blocks"):
    name = " ".join(filename.removesuffix(".png").split("_"))
    try:
        color = ColorThief("./assets/blocks/" + filename).get_color(quality=1)
    except:
        color = (255, 255, 255)

    result = {
        "name": name,
        "color": color,
        "filename": filename
    }

    all.append(result)
    if "Pixel Background" in name:
        pixel_backgrounds_only.append(result)
    if "Pixel Block" in name:
        pixel_blocks_only.append(result)
    
    print(f"Created block map index for {name}: {color}")

result = {
    "all": all,
    "pixel_backgrounds_only": pixel_backgrounds_only,
    "pixel_blocks_only": pixel_blocks_only
}

json.dump(result, open("./gen/blockmap.json", "w"))
print("Generated block map.")