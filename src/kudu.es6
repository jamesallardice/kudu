import BaseModel from './model';

export default class Kudu {

  constructor( app ) {

    // Keep a reference ot the server (usually an Express app).
    this.app = app;

    // Create the model store. All models created for this app will be
    // referenced from this object. Since models have both a singular and
    // plural name we have two stores, each keyed by one form.
    this.models = new Map();
    this.modelsByPluralName = new Map();
  }

  // Create a new model. The result will be a constructor function that can
  // produce model instances and interact with stored instances via static
  // methods.
  //
  // Arguments:
  //
  //   singular    {String}    The name of the model in singular form.
  //
  //   [plural]    {String}    The name of the model in plural form. Defaults
  //                           to the singular name with an appended 's'.
  //
  //   schema      {Object}    The fields available to instances of this model
  //                           plus the constraints applied to those fields, as
  //                           well as any relationships to other models.
  //
  createModel( singular, plural, schema ) {

    // Plural name is optional. If it isn't provided the second argument should
    // be the schema object.
    if ( typeof plural === 'object' ) {
      schema = plural;
      plural = `${ singular }s`;
    }

    if ( typeof schema !== 'object' ) {
      throw new Error('No schema provided.');
    }

    let kudu = this;

    class Model extends BaseModel {

      static singular = singular
      static plural = plural

      constructor( data ) {
        super(data);
      }
    }

    // Add the new model to the model cache.
    this.models.set(singular, Model);
    this.modelsByPluralName.set(plural, Model);

    return Model;
  }

  // Get a model constructor previously created with Kudu#createModel.
  //
  // Arguments:
  //
  //   singular    {String}    The name of the model in singular form.
  //
  getModel( singular ) {
    return this.models.get(singular);
  }
}
