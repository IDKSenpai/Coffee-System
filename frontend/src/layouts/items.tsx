import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import api from "@/services/api";

import { ScrollArea } from "@/components/ui/scroll-area";

interface Item {
  id: number;
  name: string;
  price: number;
  image?: string;
  options?: Option[];
}

interface OptionError {
  name?: string;
  values?: string[];
}

interface Option {
  name: string;
  values: string[];
}

export default function Items() {
  const [items, setItems] = useState<Item[]>([]);
  const [query, setQuery] = useState("");

  const [errors, setErrors] = useState<{
    name?: string;
    price?: string;
    options?: OptionError[];
  }>({});

  const [addItemOpen, setAddItemOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [newPreview, setNewPreview] = useState<string | null>(null);
  const [options, setOptions] = useState<Option[]>([]);

  const [editItem, setEditItem] = useState<Item | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [editOptions, setEditOptions] = useState<Option[]>([]);

  const [deleteItem, setDeleteItem] = useState<Item | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchItems = async (searchQuery: string = query) => {
    try {
      const res = await api.get("/items", { params: { q: searchQuery } });
      const itemsWithDefaultOptions = res.data.map((item: any) => ({
        ...item,
        options: Array.isArray(item.options) ? item.options : [],
      }));
      setItems(itemsWithDefaultOptions);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchItems(query);
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleAddImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImage(file);
      setNewPreview(URL.createObjectURL(file));
    }
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleAddItem = async () => {
    const newErrors: {
      name?: string;
      price?: string;
      options?: OptionError[];
    } = {};

    if (!newName.trim()) newErrors.name = "Item name is required.";
    if (!newPrice || isNaN(Number(newPrice)) || Number(newPrice) <= 0) {
      newErrors.price = "Valid price is required.";
    }

    const optionErrors: OptionError[] = options.map((opt) => {
      const err: OptionError = {};
      if (!opt.name.trim()) err.name = "Option name is required.";
      err.values = opt.values.map((val) =>
        !val.trim() ? "Value cannot be empty." : ""
      );
      return err;
    });

    if (optionErrors.some((e) => e.name || e.values?.some((v) => v))) {
      newErrors.options = optionErrors;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", newName);
      formData.append("price", newPrice);
      if (newImage) formData.append("image", newImage);
      formData.append("options", JSON.stringify(options));

      await api.post("/items", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAddItemOpen(false);
      setNewName("");
      setNewPrice("");
      setNewImage(null);
      setNewPreview(null);
      setOptions([]);
      setErrors({});
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    try {
      const formData = new FormData();
      formData.append("name", editName);
      formData.append("price", editPrice);
      if (editImage) formData.append("image", editImage);

      formData.append("options", JSON.stringify(editOptions));

      await api.post(`/items/${editItem.id}?_method=PUT`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setEditItem(null);
      setEditImage(null);
      setPreviewImage(null);
      setEditOptions([]);
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await api.delete(`/items/${deleteItem.id}`);
      setDeleteItem(null);
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between border-b pb-4 mb-4 gap-2 flex-wrap">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Search items..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full sm:w-64"
          />
          <Button onClick={() => fetchItems(query)} variant="outline">
            Search
          </Button>
        </div>

        {/* Add Item Dialog */}
        <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
          <DialogTrigger asChild>
            <Button className="bg-black text-white hover:bg-gray-800">
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" aria-describedby="">
            <DialogHeader>
              <DialogTitle className="text-center">Add New Item</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-130 w-auto rounded-md border-transparent p-2">
              <div className="flex flex-col gap-2 m-4">
                <label htmlFor="name">Name:</label>
                <Input
                  id="name"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name}</p>
                )}
                <label htmlFor="price">Price:</label>
                <Input
                  id="price"
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="Price"
                  min={0}
                />
                {errors.price && (
                  <p className="text-red-500 text-sm">{errors.price}</p>
                )}

                {/* Image */}
                <div className="flex flex-col gap-2">
                  <label>Image:</label>
                  {newPreview ? (
                    <img
                      src={newPreview}
                      alt="Preview"
                      className="h-32 w-full object-cover rounded border"
                    />
                  ) : (
                    <div className="h-32 flex items-center justify-center text-gray-400 border rounded">
                      No Image Selected
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    id="add-image"
                    className="hidden"
                    onChange={handleAddImageChange}
                  />
                  <label
                    htmlFor="add-image"
                    className="cursor-pointer bg-green-500 w-30 text-white px-4 py-2 rounded hover:bg-green-600 text-center"
                  >
                    Add Image
                  </label>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <label htmlFor="options" className="font-semibold">
                    Options (e.g., Sugar, Ice):
                  </label>
                  {options.map((opt, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col gap-1 border p-2 rounded"
                    >
                      <div className="flex gap-2 items-center">
                        <Input
                          id="options"
                          type="text"
                          placeholder="Option Name"
                          value={opt.name}
                          onChange={(e) => {
                            const newOptions = [...options];
                            newOptions[idx].name = e.target.value;
                            setOptions(newOptions);
                          }}
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            const newOptions = [...options];
                            newOptions[idx].values.push("");
                            setOptions(newOptions);
                          }}
                        >
                          + Value
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            const newOptions = options.filter(
                              (_, i) => i !== idx
                            );
                            setOptions(newOptions);
                          }}
                        >
                          Remove Option
                        </Button>
                      </div>

                      {opt.values.map((val, vIdx) => (
                        <div
                          key={vIdx}
                          className="flex gap-2 items-center ml-4"
                        >
                          <Input
                            type="text"
                            placeholder="Value (e.g., 50%)"
                            value={val}
                            onChange={(e) => {
                              const newOptions = [...options];
                              newOptions[idx].values[vIdx] = e.target.value;
                              setOptions(newOptions);
                            }}
                          />
                          <Button
                            variant="destructive"
                            onClick={() => {
                              const newOptions = [...options];
                              newOptions[idx].values.splice(vIdx, 1);
                              setOptions(newOptions);
                            }}
                          >
                            Remove Value
                          </Button>
                        </div>
                      ))}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() =>
                      setOptions([...options, { name: "", values: [] }])
                    }
                  >
                    + Add Option
                  </Button>
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="mt-4 flex justify-between">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleAddItem}>Add Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <div className="my-4">No items list</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4 my-4">
          {items.map((item) => (
            <Card key={item.id} className="flex flex-col">
              <CardHeader>
                <div className="border h-40 rounded-2xl overflow-hidden">
                  {item.image ? (
                    <img
                      src={`http://localhost:8000/storage/${item.image}`}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <label htmlFor="name">Name:</label>
                  <p className="font-semibold">{item.name}</p>
                </div>
                <div className="flex justify-between">
                  <label htmlFor="price">Price:</label>
                  <p className="text-red-500">${item.price}</p>
                </div>

                {Array.isArray(item.options) && item.options.length > 0 && (
                  <div className="mt-2">
                    <p className="font-semibold">Options:</p>
                    <ul className="list-none space-y-2">
                      {item.options.map((opt, i) => (
                        <li key={i}>
                          <strong>{opt.name}</strong>
                          <ul className="list-disc list-inside ml-4">
                            {Array.isArray(opt.values) &&
                            opt.values.length > 0 ? (
                              opt.values.map((val, vIdx) => (
                                <li key={vIdx}>{val}</li>
                              ))
                            ) : (
                              <li>No values</li>
                            )}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                {/* Edit */}
                <Dialog
                  open={editItem?.id === item.id}
                  onOpenChange={(open) => !open && setEditItem(null)}
                >
                  <DialogTrigger asChild>
                    <Button
                      className="bg-blue-500 hover:bg-blue-600"
                      onClick={() => {
                        setEditItem(item);
                        setEditName(item.name);
                        setEditPrice(String(item.price));
                        setPreviewImage(
                          item.image
                            ? `http://localhost:8000/storage/${item.image}`
                            : null
                        );
                        setEditImage(null);
                        setEditOptions(item.options ? [...item.options] : []);
                      }}
                    >
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md" aria-describedby="">
                    <DialogHeader>
                      <DialogTitle className="text-center">
                        Edit Item
                      </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-130 w-auto rounded-md border-transparent p-2">
                      <div className="flex flex-col gap-2 m-4">
                        <label htmlFor="name">Name:</label>
                        <Input
                          id="name"
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Name"
                        />
                        <label htmlFor="price">Price:</label>
                        <Input
                          id="price"
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          placeholder="Price"
                        />

                        <div className="flex flex-col gap-2">
                          <label>Image:</label>
                          {previewImage ? (
                            <img
                              src={previewImage}
                              alt="Preview"
                              className="h-32 w-full object-cover rounded border"
                            />
                          ) : (
                            <div className="h-32 flex items-center justify-center text-gray-400 border rounded">
                              No Image Selected
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id={`edit-image-${item.id}`}
                            onChange={handleEditImageChange}
                          />
                          <label
                            htmlFor={`edit-image-${item.id}`}
                            className="cursor-pointer bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-center w-50"
                          >
                            {editImage ? "Choose Image" : "Change Image"}
                          </label>
                        </div>

                        <div className="flex flex-col gap-2 mt-4">
                          <label htmlFor="options" className="font-semibold">
                            Options:
                          </label>
                          {editOptions.map((opt, idx) => (
                            <div
                              key={idx}
                              className="flex flex-col gap-1 border p-2 rounded"
                            >
                              <div className="flex gap-2 items-center">
                                <Input
                                  id="options"
                                  type="text"
                                  placeholder="Option Name"
                                  value={opt.name}
                                  onChange={(e) => {
                                    const newOptions = [...editOptions];
                                    newOptions[idx].name = e.target.value;
                                    setEditOptions(newOptions);
                                  }}
                                />
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    const newOptions = [...editOptions];
                                    newOptions[idx].values.push("");
                                    setEditOptions(newOptions);
                                  }}
                                >
                                  + Value
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => {
                                    const newOptions = editOptions.filter(
                                      (_, i) => i !== idx
                                    );
                                    setEditOptions(newOptions);
                                  }}
                                >
                                  Remove Option
                                </Button>
                              </div>

                              {opt.values.map((val, vIdx) => (
                                <div
                                  key={vIdx}
                                  className="flex gap-2 items-center ml-4"
                                >
                                  <Input
                                    type="text"
                                    placeholder="Value (e.g., 50%)"
                                    value={val}
                                    onChange={(e) => {
                                      const newOptions = [...editOptions];
                                      newOptions[idx].values[vIdx] =
                                        e.target.value;
                                      setEditOptions(newOptions);
                                    }}
                                  />
                                  <Button
                                    variant="destructive"
                                    onClick={() => {
                                      const newOptions = [...editOptions];
                                      newOptions[idx].values.splice(vIdx, 1);
                                      setEditOptions(newOptions);
                                    }}
                                  >
                                    Remove Value
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            className="mt-2"
                            onClick={() =>
                              setEditOptions([
                                ...editOptions,
                                { name: "", values: [] },
                              ])
                            }
                          >
                            + Add Option
                          </Button>
                        </div>
                      </div>
                    </ScrollArea>

                    <DialogFooter className="mt-4 flex justify-between">
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button onClick={handleUpdate}>Update Item</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={deleteItem?.id === item.id}
                  onOpenChange={(open) => !open && setDeleteItem(null)}
                >
                  <DialogTrigger asChild>
                    <Button
                      className="bg-red-500 hover:bg-red-600"
                      onClick={() => setDeleteItem(item)}
                    >
                      Delete
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md" aria-describedby="">
                    <DialogHeader>
                      <DialogTitle>Confirm Delete</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to delete "{item.name}"?</p>
                    <DialogFooter className="mt-4 flex justify-between">
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-600"
                      >
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
