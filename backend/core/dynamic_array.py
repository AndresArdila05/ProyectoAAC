class DynamicArray:
    def __init__(self, capacity=2):
        self.capacity = capacity
        self.size = 0
        self.data = [None] * capacity

    def __len__(self):
        return self.size

    def push(self, value):
        if self.size == self.capacity:
            self._resize()
        self.data[self.size] = value
        self.size += 1

    def pop(self):
        if self.size == 0:
            raise IndexError("Pop from empty DynamicArray")
        value = self.data[self.size - 1]
        self.data[self.size - 1] = None  # Limpieza opcional
        self.size -= 1
        return value

    def _resize(self):
        self.capacity *= 2
        new_data = [None] * self.capacity
        for i in range(self.size):
            new_data[i] = self.data[i]
        self.data = new_data

    def get(self, index):
        if 0 <= index < self.size:
            return self.data[index]
        raise IndexError("Index out of bounds")

    def set(self, index, value):
        if 0 <= index < self.size:
            self.data[index] = value
        else:
            raise IndexError("Index out of bounds")

    def __repr__(self):
        return f"[{', '.join(str(self.data[i]) for i in range(self.size))}]"
