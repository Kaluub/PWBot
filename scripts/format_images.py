import os

for filename in os.listdir("./assets/blocks"):
    name = filename.removesuffix(".png")
    if "_" in name:
        continue

    words = []
    current_word = ""
    for char in name:
        if char.isupper():
            if len(current_word):
                words.append(current_word)
            current_word = ""
        current_word += char
    words.append(current_word)

    new_filename = "_".join(words) + ".png"
    os.rename("./assets/blocks/" + filename, "./assets/blocks/" + new_filename)
    print(f"Moved {filename} to {new_filename}...")

print("Bulk rename complete.")