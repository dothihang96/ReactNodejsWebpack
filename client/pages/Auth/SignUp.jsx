import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Input,Icon, Result, Row } from 'antd';
import { useMutation } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import PropTypes from 'prop-types';

import { SIGN_UP } from '../../graphql/user';
import { SIGN_UP as SIGN_UP_ACTION } from '../../store/auth';
import { useStore } from '../../store';

const FormItem = Form.Item;

const RegisterForm = ({ history, location }) => {
  const initialValidation = { status: '', help: '' };
  const [validation, setValidation] = useState(initialValidation);
  const [{ auth }, dispatch] = useStore();
  const user = _.get(auth, 'user._id');
  useEffect(() => {
    setValidation(initialValidation);
  }, [location.pathname, user]);

const [signup, { data , loading, error } ] = useMutation(SIGN_UP);

const onFinish = (input) => {
    const val = { status: 'validating', help: 'Please wait...' };
    setValidation(val);
    signup({ variables: { input } })
      .then(() => history.push('/signup'));
    if(data){
      dispatch({ type: SIGN_UP_ACTION, payload: data.signup })
    }
  };

  const SingUpResult = () => (
    <Result
      status="success"
      title="You have signed up successfully!"
      subTitle="Please proceed to the login page."
      extra={[
        <Button
          type="primary"
          key="signup"
          onClick={() => history.push('/signin')}
        >
          Sign in
        </Button>
      ]}
    />
  );
  const grid = {
    xs: { span: 24 },
    sm: { span: 20 },
    md: { span: 16 },
    lg: { span: 12 }
  };
  return (
    <div>
      {!user ? (
            <Row
              type="flex"
              justify="center"
              align="middle"
              style={{ margin: '10%' }}
            >
              {error && console.error('Apollo: ', error)}
              <Col {...grid}>
                <Card title="Sign up">
                  <Form onFinish={onFinish}>
                    <FormItem
                      name = 'name' 
                      rules ={[
                        {
                          required: true,
                          message: 'Please input your user name!',
                          min: 6
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
                        placeholder="Username"
                      />
                    </FormItem>
                    <FormItem
                      name = 'email' 
                      rules = {
                        [
                          {
                            required: true,
                            message: 'Please input your Email!',
                            type: 'email'
                          }
                        ]
                      }
                    >
                    <Input
                      prefix={
                        <Icon
                          type="mail"
                          style={{ color: 'rgba(0,0,0,.25)' }}
                        />
                      }
                      placeholder="Email"
                    />
                    </FormItem>
                    <FormItem
                        name = "password"
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
                        loading={loading}
                        type="primary"
                        htmlType="submit"
                        style={{ width: '100%' }}
                      >
                        Continue
                      </Button>
                    </FormItem>
                  </Form>
                </Card>
              </Col>
            </Row>
      ) : (
        <SingUpResult />
      )}
    </div>
  );
};
RegisterForm.propTypes = {
  form: PropTypes.any.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  refetch: PropTypes.func.isRequired
};

export default withRouter(RegisterForm);
