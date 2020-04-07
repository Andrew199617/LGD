# LGD
Use OLOO pattern. Check out VSC extensions by LearnGameDevelopment to have syntax highlighting.

# Why to use this module.
[Objects Linked to Other Objects Article](https://www.learngamedevelopment.net/blog/oloo(objectslinkingtootherobjects))

# Examples

## Using Oloo.assign
``` js
const { setup } = require('@learngamedevelopment/oloo');
setup();

const Object1 = {
  create() {
    const object1 = Object.create(Object1);

    object1.var = 0;
    object1.var2 = 'hi';

    return object1;
  },

  virtualMethod() {
    console.log('Base Class!');
  }
}

const Object2 = {
  create() {
    const object2 = Oloo.assign(Object1.create(), Object2);
    return object2;
  },

  virtualMethod() {
    Oloo.base(this, this.virtualMethod);
    console.log('Inherited Class!');
  }
}

const object2Instance = Object2.create();
object2Instance.virtualMethod();
// Base Class!
// Inherited Class!
```

## Using Oloo.assignSlow + Oloo.createSlow
``` js
const { setup } = require('@learngamedevelopment/oloo');
setup();

const Object1 = {
  create() {
    // must use createSlow in the first object of the chain.
    const object1 = Object.createSlow(Object1);

    object1.var = 0;
    object1.var2 = 'hi';

    return object1;
  },

  virtualMethod() {
    console.log('Base Class!');
  }
}

const Object2 = {
  create() {
    const object2 = Oloo.assignSlow(Object1.create(), Object2);
    return object2;
  },

  virtualMethod() {
    Oloo.base(this, this.virtualMethod);
    console.log('Inherited Class!');
  }
}

const object2Instance = Object2.create();
object2Instance.virtualMethod();
// Base Class!
// Inherited Class!
```

# Release Notes

## 2.1.0 

- Improved speed tremendously. Kept older assign as assignSlow for creating classes that don't get created often.