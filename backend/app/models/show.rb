class Show < ActiveRecord::Base
  validates :title, :image_url, :presence => true
  validates :title, :uniqueness => true

  has_many :episodes, :dependent => :destroy
  has_many :subscriptions
  has_many :users, :through => :subscriptions
end
