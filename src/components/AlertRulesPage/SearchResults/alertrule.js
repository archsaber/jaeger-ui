// @flow

import * as React from 'react';
import { Input, Switch } from 'antd';
import { Form, Button } from 'antd';
import { Field, reduxForm, isDirty } from 'redux-form';
import reduxFormFieldAdapter from '../../../utils/redux-form-field-adapter';
import VirtSelect from '../../common/VirtSelect';
import * as jaegerApiActions from '../../../actions/jaeger-api';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import './alertrule.css';
import '../SearchForm.css';

const FormItem = Form.Item;
const AdaptedVirtualSelect = reduxFormFieldAdapter(VirtSelect, option => (option ? option.value : null));
const AdaptedInput = reduxFormFieldAdapter(Input);

function switchAdapter(props) {
    const { input: { value, onChange }, children, ...rest } = props;
    return (
      <Switch
        value={!value}
        checked={!value}
        onChange={(newValue) => onChange(!newValue)}
        {...rest}
      >
        {children}
      </Switch>
    );
  };

function submitForm(fields, setAlertRule) {
    const newFields = {...fields,
        Duration: parseFloat(fields.Duration) * 1e3 * 60,
        Limit: parseFloat(fields.Limit)
    }
    setAlertRule(newFields);
}
  

class AlertRuleImpl extends React.PureComponent {
  props;

  render() {
    const { Service, Operation, Measure, handleSubmit } = this.props

    return (
      <div className="ResultItem">
        <div className="ResultItem--title clearfix">
            <h3 className="ub-m0 ub-relative">{Service + (Operation !== "" ? " : " + Operation : "")}</h3>
        </div>
        <Form layout='inline' style={{padding: '4px'}} onSubmit={handleSubmit}>
            <FormItem>
                <Field
                    name='Disabled'
                    component={switchAdapter}
                />
            </FormItem>
            <FormItem>
                <Field
                    name='Function'
                    component={AdaptedVirtualSelect}
                    clearable={false}
                    props={{
                        options: [
                            { label: 'Max', value: 'max' },
                            { label: 'Min', value: 'min' },
                            { label: 'Avg', value: 'avg' }]
                    }}
                />
            </FormItem>

            <FormItem>
                    {Measure.toUpperCase()}
            </FormItem>

            <FormItem>
                <Field
                    name='Upper'
                    component={AdaptedVirtualSelect}
                    clearable={false}
                    props={{
                        options: [{ label: '<', value: true }, { label: '>', value: false }]
                    }}
                />
            </FormItem>

            <FormItem>
                <Field
                    name='Limit'
                    component={AdaptedInput}
                />
            </FormItem>

            <FormItem>
                { "over"}
            </FormItem>

            <FormItem>
                <Field
                    name='Duration'
                    component={AdaptedInput}
                >
                </Field>
            </FormItem>

            <FormItem>
                { "minutes"}
            </FormItem>

            <Button disabled={!this.props.dirty} htmlType="submit" style={{verticalAlign: 'middle'}} >
                Save
            </Button>
        </Form>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
    const { setAlertRule } = bindActionCreators(jaegerApiActions, dispatch);
    return {
      onSubmit: fields => submitForm(fields, setAlertRule),
    };
}



export default connect((state, props) => ({dirty: isDirty(props.form)(state)}), mapDispatchToProps)(reduxForm()(AlertRuleImpl));