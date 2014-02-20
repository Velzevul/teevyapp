class User < ActiveRecord::Base
  acts_as_authentic

  has_many :subscriptions
  has_many :shows, :through => :subscriptions

  def subscription_id(show)
    show = subscriptions.find_by_show_id(show.id)
    return show.id if show.present?
    return nil
  end

  def self.find_by_login_or_email(s)
    find_by_login(s) || find_by_email(s)
  end
end