---
layout: single
author: Huijo
date: 2023-06-14
tags:
   - Programing
classes: wide
title:  Python Class Method
---

Knowing a few fundamental Python methods help make better code.

__str__:

The __str__ method is used to provide a string representation of an object.
It is called by the str() function and when the object is used in string contexts (e.g., using print()).
Overriding __str__ allows you to define a human-readable string representation of your objects.

```python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def __str__(self):
        return f"Person: {self.name}, {self.age} years old"

person = Person("Alice", 25)
print(person)  # Output: Person: Alice, 25 years old
```

__repr__:

The __repr__ method is used to provide a string representation of an object that is primarily used for debugging and representation in the interactive console.
It is called by the repr() function and provides a detailed and unambiguous representation of the object.

```python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def __repr__(self):
        return f"Person({self.name}, {self.age})"

person = Person("Alice", 25)
print(repr(person))  # Output: Person(Alice, 25)
```

__len__:

The __len__ method is used to define the length of an object.
It is called by the len() function and should return an integer representing the length of the object.
This method allows objects of a class to support the built-in len() function.

```python
class MyList:
    def __init__(self):
        self.items = []

    def __len__(self):
        return len(self.items)

my_list = MyList()
my_list.items = [1, 2, 3, 4]
print(len(my_list))  # Output: 4
```

__getitem__ and __setitem__:

The __getitem__ and __setitem__ methods are used to define the behavior of accessing elements of an object using indexing (e.g., obj[index]).
__getitem__ is called when retrieving an item by index, and __setitem__ is called when assigning a value to an item by index.

```python
class MyList:
    def __init__(self):
        self.items = []

    def __getitem__(self, index):
        return self.items[index]

    def __setitem__(self, index, value):
        self.items[index] = value

my_list = MyList()
my_list.items = [1, 2, 3, 4]
print(my_list[2])  # Output: 3
my_list[2] = 5
print(my_list[2])  # Output: 5
```

__del__:

The __del__ method is used to define the behavior when an object is about to be destroyed or garbage collected.
It is called when the object's reference count reaches zero, indicating that there are no more references to the object.
The __del__ method can be used to release resources, close files, or perform any necessary cleanup actions.
```python
class MyClass:
    def __del__(self):
        print("Object destroyed")

obj = MyClass()
del obj  # Output: Object destroyed
```

__enter__ and __exit__ (Context Managers):

The __enter__ and __exit__ methods are used to define a context manager, allowing you to control the setup and teardown of resources within a with statement.
The __enter__ method is called when entering the context, and the __exit__ method is called when exiting the context, even if an exception occurs.
Context managers are commonly used to manage file opening and closing, acquiring and releasing locks, and other resource management scenarios.
```python
class FileHandler:
    def __init__(self, filename):
        self.filename = filename

    def __enter__(self):
        self.file = open(self.filename, 'r')
        return self.file

    def __exit__(self, exc_type, exc_value, exc_traceback):
        self.file.close()

with FileHandler('example.txt') as f:
    for line in f:
        print(line)
```

__getattr__ and __setattr__:

The __getattr__ and __setattr__ methods are used to define custom behavior when accessing or assigning attribute values of an object.
__getattr__ is called when accessing an attribute that doesn't exist, and __setattr__ is called when assigning a value to an attribute.
These methods can be used to implement dynamic attribute access, validation, or interception of attribute-related operations.
```python
class Person:
    def __getattr__(self, name):
        return f"Attribute '{name}' doesn't exist"

    def __setattr__(self, name, value):
        if name == 'age' and value < 0:
            raise ValueError("Age must be a positive number")
        else:
            self.__dict__[name] = value

person = Person()
print(person.name)  # Output: Attribute 'name' doesn't exist
person.age = 25
print(person.age)  # Output: 25
person.age = -5  # Raises ValueError
```