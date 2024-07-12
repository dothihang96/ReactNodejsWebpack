import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Icon, Input, Row } from 'antd';
import { useMutation } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import { SIGN_IN } from '../../graphql/user';

const FormItem = Form.Item;

const LoginForm = ({ history, location, form, refetch }) => {
  const initialValidation = { status: '', help: '' };
  const [validation, setValidation] = useState(initialValidation);
  useEffect(() => {
    setValidation(initialValidation);
  }, [location.pathname]);
const [signin ] = useMutation(SIGN_IN);

const onFinish = (input) => {
    const val = { status: 'validating', help: 'Please wait...' };
        setValidation(val);
        signin({ variables: { input } })
          .then(async ({ data }) => {
            localStorage.setItem('token', data.signin.token);
            await refetch();
            history.push('/');
          })
          .catch(error => {
            let errMsg;
            if(error.graphQLErrors[0]){
              errMsg = error.graphQLErrors[0].message;
            }else{
              errMsg = error.networkError.result.errors[0].message;
            }
            setValidation({
              visible: true,
              help: errMsg
            });
          });
  };
  const grid = {
    xs: { span: 24 },
    sm: { span: 20 },
    md: { span: 16 },
    lg: { span: 12 }
  };
  return (
        <Row
          type="flex"
          justify="center"
          align="middle"
          style={{ margin: '10%' }}
        >
          <Col {...grid}>
            <Card title="Sign In">
              <Form onFinish={onFinish}>
                <FormItem
                  name = 'email' 
                  rules= {[
                    {
                      required: true,
                      message: 'Please input your Email!',
                      type: 'email'
                    }
                  ]} 
                >
              <Input
                prefix={
                  <Icon
                    type="user"
                    style={{ color: 'rgba(0,0,0,.25)' }}
                  />
                }
                placeholder="Email"
              />
                </FormItem>
                <FormItem
                  name = 'password' 
                  rules= {[
                    {
                      required: true,
                      message: 'Please input your password!',
                      min: 6
                    }
                  ]} 
                >
                  <Input
                      prefix={
                        <Icon
                          type="lock"
                          style={{ color: 'rgba(0,0,0,.25)' }}
                        />
                      }
                      type="password"
                      placeholder="Password"
                    />
                </FormItem>
                <FormItem
                  validateStatus={validation.status}
                  help={validation.help}
                >
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{ width: '100%' }}
                  >
                    Sign In
                  </Button>
                  No account?
                  <a href="/signup" style={{ marginLeft: '5px' }}>
                    Sign up now!
                  </a>
                </FormItem>
              </Form>
            </Card>
          </Col>
        </Row>
  );
};
LoginForm.propTypes = {
  form: PropTypes.any.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  refetch: PropTypes.func.isRequired
};

export default withRouter(LoginForm);
