import BootstrapVue from 'bootstrap-vue'
import { mount, createLocalVue, RouterLinkStub } from '@vue/test-utils'

import Header from '@/components/Header.vue'

const localVue = createLocalVue()
localVue.use(BootstrapVue)

describe('Header.vue', () => {
  it('renders a header component', () => {
    const wrapper = mount(Header, {localVue})
    expect(wrapper.attributes()).toMatchObject({class: 'header container'})
    expect(wrapper.find('div.header')
                  .find('nav.navbar')
                  .find('div.navbar-brand').text()).toMatch('UOA-POC2')
    expect(wrapper.find('div.header')
                  .find('nav.navbar')
                  .find('ul.navbar-nav.ml-auto')
                  .find('li.form-inline')
                  .find('form.form-inline')
                  .find('a.cart').text()).toMatch('カート')
    expect(wrapper.find('div.header')
                  .find('nav.navbar')
                  .find('ul.navbar-nav.ml-auto')
                  .find('li.form-inline')
                  .find('form.form-inline')
                  .find('a.histories').text()).toMatch('注文履歴')
  })

  it('links some b-button objects to named paths', () => {
    const wrapper = mount(Header, {localVue, stubs: {BButton: RouterLinkStub}})
    const links = wrapper.findAll(RouterLinkStub)
    expect(links.length).toBe(2)
    expect(links.at(0).props().to).toMatchObject({name: 'cart'})
    expect(links.at(1).props().to).toMatchObject({name: 'histories'})
  })
})
