import React, { Component } from 'react';
import Formsy, { Form } from 'formsy-react';
import Input from './Input';
import Select from './Select';
import { isIdentity, isMobile ,isEmail} from 'scripts/utils/validation';

Formsy.addValidationRule('isMobile', function (values, value) {
    return isMobile(value);
});

Formsy.addValidationRule('isIdentity', function (values, value) {
    return isIdentity(value);
});

Formsy.addValidationRule('isEmail', function (values, value) {
    return isEmail(value);
});

Formsy.addValidationRule('isMobileOrEmail', function (values, value) {
    return isEmail(value)||isMobile(value);
});

let DSForm = {};
DSForm.Form = Form;
DSForm.Input = Input;
DSForm.Select = Select;

export { Form, Input, Select };
export default DSForm;
